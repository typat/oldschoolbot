import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { LampTable } from '../xpLamps';
import { AllBarrows, BattlestaffTable, runeAlchablesTable, StaffOrbTable } from './sharedTables';

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

export const ClueTable = new LootTable()
	.add('Clue scroll (beginner)')
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)')
	.add('Clue scroll (master)')
	.add(MasterClueTable)
	.add(EliteClueTable)
	.add(HardClueTable);

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

export const DragonTable = new LootTable()
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon boots', [1, 5], 2)
	.add('Dragon pickaxe', [1, 5], 2)
	.add('Dragon scimitar', [1, 5], 2)
	.add('Dragon platelegs', [1, 5], 2)
	.add('Dragon chainbody', [1, 5])
	.add('Dragon mace', [1, 5], 2)
	.add('Dragon battleaxe', [1, 5], 2)
	.add('Dragon plateskirt', [1, 5], 2);

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 100)
	.add('Untradeable mystery box', 1, 40)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');

const runeTable = new LootTable()
	.add('Nature rune', [3000, 5000])
	.add('Law rune', [3000, 5000])
	.add('Death rune', [3000, 5000])
	.add('Blood rune', [3000, 5000])
	.add('Soul rune', [3000, 5000])
	.add('Wrath rune', [3000, 5000])
	.add('Astral rune', [3000, 5000]);

const LogsTable = new LootTable()
	.add('Teak logs', [20, 100])
	.add('Mahogany logs', [5, 50])
	.add('Yew logs', [50, 150])
	.add('Magic logs', [20, 100])
	.add('Elder logs', [5, 50]);

const Supplies = new LootTable()
	.add('Saradomin brew(4)', [6, 13], 2)
	.add('Super restore(4)', [6, 13], 2)
	.add(StaffOrbTable, [100, 300], 1, { multiply: true })
	.add('Mysterious seed');

const DyeTable = new LootTable()
	.add('Third age dye', 2)
	.add('Blood dye', 1, 3)
	.add('Shadow dye', 1, 3)
	.add('Ice dye', 1, 3)
	.add('Dungeoneering dye', 1, 3);

const table = new LootTable()
	.tertiary(2500, ClueHunterTable)
	.tertiary(10_000, BlessingTable)
	.tertiary(10_000, DyeTable)
	.tertiary(8000, 'Ring of luck')
	.tertiary(3000, 'Deathtouched dart')
	.tertiary(50, LampTable)
	.tertiary(50, new LootTable().add('Ignecarus mask').add('Malygos mask'))
	.tertiary(
		130_000,
		new LootTable()
			.add('First age tiara')
			.add('First age amulet')
			.add('First age cape')
			.add('First age bracelet')
			.add('First age ring')
	)
	.add(ClueTable, [1, 3])
	.tertiary(30, boxTable, [1, 3])
	.add(DragonTable, [5, 12], 2)
	.add(runeTable, [1, 5])
	.every(runeAlchablesTable, [1, 4])
	.add(runeAlchablesTable, 12, 2)
	.add(BattlestaffTable, 20, 2)
	.add('Coins', [500_000, 5_000_000])
	.add(AllBarrows, 3)
	.add(LogsTable, 4)
	.add(Supplies, 1, 5)
	.oneIn(90, 'Holiday mystery box');

class GrandmasterClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(5, 11);

			for (let i = 0; i < numberOfRolls; i++) {
				loot.add(table.roll());
			}
		}

		return loot.values();
	}
}

export const GrandmasterClueTable = new GrandmasterClue({ table });