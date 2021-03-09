import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../lib/minions/functions/isImportantItemForMonster';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';
import { addBanks, itemID, multiplyBank, noOp, randomItemFromArray, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: GroupMonsterActivityTaskOptions) {
		const { monsterID, channelID, quantity, users, leader } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			let loot = monster.table.kill(1);
			if (roll(10) && monster.id !== 696969) {
				loot = multiplyBank(loot, 4);
				loot[getRandomMysteryBox()] = 1;
			}
			const userWhoGetsLoot = randomItemFromArray(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = addBanks([currentLoot ?? {}, loot]);
			kcAmounts[userWhoGetsLoot] = Boolean(kcAmounts[userWhoGetsLoot])
				? ++kcAmounts[userWhoGetsLoot]
				: 1;
		}

		const leaderUser = await this.client.users.fetch(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		const totalLoot = new Bank();

		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			const kcToAdd = kcAmounts[user.id];
			if (user.equippedPet() === itemID('Ori')) {
				loot = addBanks([monster.table.kill(Math.ceil(kcToAdd * 0.25)) ?? {}, loot]);
			}
			await user.addItemsToBank(loot, true);
			totalLoot.add(loot);

			if (kcToAdd) user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), monster)
			);

			resultStr += `${
				purple ? Emoji.Purple : ''
			} **${user} received:** ||${await createReadableItemListFromBank(
				this.client,
				loot
			)}||\n`;

			announceLoot(this.client, leaderUser, monster, quantity, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);
		if (usersWithoutLoot.length > 0) {
			resultStr += `${usersWithoutLoot.map(id => `<@${id}>`).join(', ')} - Got no loot, sad!`;
		}

		handleTripFinish(
			this.client,
			leaderUser,
			channelID,
			resultStr,
			undefined,
			undefined,
			data,
			totalLoot.bank
		);
	}
}
