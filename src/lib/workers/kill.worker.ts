import '../customItems/customItems';
import '../data/itemAliases';

import { Bank, Misc, Monsters } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util/bank';

import { stringMatches } from '../util/cleanString';
import { KillWorkerArgs, KillWorkerReturn } from '.';

export default ({ quantity, bossName, limit, catacombs, onTask }: KillWorkerArgs): KillWorkerReturn => {
	const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));

	if (osjsMonster) {
		if (quantity > limit) {
			return {
				error:
					`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
					'*You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>'
			};
		}

		return { bank: osjsMonster.kill(quantity, { inCatacombs: catacombs, onSlayerTask: onTask }) };
	}

	if (['nightmare', 'the nightmare'].some(alias => stringMatches(alias, bossName))) {
		let bank = {};
		if (quantity > 10_000) {
			return { error: 'I can only kill a maximum of 10k nightmares a time!' };
		}
		for (let i = 0; i < quantity; i++) {
			bank = addBanks([
				bank,
				Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: false }).id
			]);
		}
		return { bank: new Bank(bank) };
	}

	return { error: "I don't have that monster!" };
};
