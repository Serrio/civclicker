"use strict";
/**
	CivClicker
	Copyright (C) 2014; see the AUTHORS file for authorship.

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program in the LICENSE file.
	If it is not there, see <http://www.gnu.org/licenses/>.
**/


var version = 19;
var versionData = {
	major:  1,
	minor:  1,
	sub:   31,
	mod:   "alpha"
};
var saveTag1 = "civ";
var saveTag2 = "civ2";
var logRepeat = 1;

// Civ size category minimums
var civSizes = [];
civSizes.thorp       = civSizes.length; civSizes[civSizes.thorp      ] = { min_pop :      0, name : "Thorp"       , id : "thorp"      };
civSizes.hamlet      = civSizes.length; civSizes[civSizes.hamlet     ] = { min_pop :     20, name : "Hamlet"      , id : "hamlet"     };
civSizes.village     = civSizes.length; civSizes[civSizes.village    ] = { min_pop :     60, name : "Village"     , id : "village"    };
civSizes.smallTown   = civSizes.length; civSizes[civSizes.smallTown  ] = { min_pop :    200, name : "Small Town"  , id : "smallTown"  };
civSizes.largeTown   = civSizes.length; civSizes[civSizes.largeTown  ] = { min_pop :   2000, name : "Large Town"  , id : "largeTown"  };
civSizes.smallCity   = civSizes.length; civSizes[civSizes.smallCity  ] = { min_pop :   5000, name : "Small City"  , id : "smallCity"  };
civSizes.largeCity   = civSizes.length; civSizes[civSizes.largeCity  ] = { min_pop :  10000, name : "Large City"  , id : "largeCity"  };
civSizes.metropolis  = civSizes.length; civSizes[civSizes.metropolis ] = { min_pop :  20000, name : "Metropolis"  , id : "metropolis" };
civSizes.smallNation = civSizes.length; civSizes[civSizes.smallNation] = { min_pop :  50000, name : "Small Nation", id : "smallNation"};
civSizes.nation      = civSizes.length; civSizes[civSizes.nation     ] = { min_pop : 100000, name : "Nation"      , id : "nation"     };
civSizes.largeNation = civSizes.length; civSizes[civSizes.largeNation] = { min_pop : 200000, name : "Large Nation", id : "largeNation"};
civSizes.empire      = civSizes.length; civSizes[civSizes.empire     ] = { min_pop : 500000, name : "Empire"      , id : "empire"     };

civSizes.getCivSize = function(popcnt) {
	var i;
	for(i = this.length - 1; i >= 0; --i){
		if (popcnt >= this[i].min_pop) { return this[i]; }
	}
	return this[0];
};

// To find the max pop, we look at the next entry's min_pop and subtract one.
// If this is the last entry, return -1.
// xxx Should we return Infinity instead?  If so, need to modify invade().
civSizes.getMaxPop = function(civType) {
	if ((civSizes[civType] + 1) < civSizes.length)
	{	
		return civSizes[civSizes[civType] + 1].min_pop - 1;
	}
	return -1;
};

// Declare variables here so they can be referenced later.  
var population, efficiency, upgrades;
var food, wood, stone;

var upgradeData = {
skinning: {
	id:"skinning",
	name:"Skinning",
	require: { skins: 10 },
	effectText:"Farmers can collect skins",
	onGain: function() { efficiency.farmers += 0.1; }
},
harvesting: {
	id:"harvesting",
	name:"Harvesting",
	require: { herbs: 10 },
	effectText:"Woodcutters can collect herbs" 
},
prospecting: {
	id:"prospecting",
	name:"Prospecting",
	require: { ore: 10 },
	effectText:"Miners can collect ore" 
},
domestication: {
	id:"domestication",
	name:"Domestication",
	prereqs:{ masonry: true },
	require: { leather: 20 },
	effectText:"Increase farmer food output" 
},
ploughshares: {
	id:"ploughshares",
	name:"Ploughshares",
	prereqs:{ masonry: true },
	require: { metal:20 },
	effectText:"Increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
irrigation: {
	id:"irrigation",
	name:"Irrigation",
	prereqs:{ masonry: true },
	require: {
		wood: 500,
		stone: 200 },
	effectText:"Increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
butchering: {
	id:"butchering",
	name:"Butchering",
	prereqs:{ construction: true, skinning: true },
	require: { leather: 40 },
	effectText:"More farmers collect more skins" 
},
gardening: {
	id:"gardening",
	name:"Gardening",
	prereqs:{ construction: true, harvesting: true },
	require: { herbs: 40 },
	effectText:"More woodcutters collect more herbs" 
},
extraction: {
	id:"extraction",
	name:"Extraction",
	prereqs:{ construction: true, prospecting: true },
	require: { metal: 40 },
	effectText:"More miners collect more ore" 
},
flensing: {
	id:"flensing",
	name:"Flensing",
	prereqs:{ architecture: true },
	require: { metal: 1000 },
	effectText:"Collect skins more frequently",
	onGain: function() { food.specialchance += 0.1; }
},
macerating: {
	id:"macerating",
	name:"Macerating",
	prereqs:{ architecture: true },
	require: {
		leather: 500,
		stone: 500 },
	effectText:"Collect ore more frequently",
	onGain: function() { stone.specialchance += 0.1; }
},
croprotation: {
	id:"croprotation",
	name:"Crop Rotation",
	prereqs:{ architecture: true },
	require: {
		herbs: 5000,
		piety: 1000 },
	effectText:"Increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
selectivebreeding: {
	id:"selectivebreeding",
	name:"Selective Breeding",
	prereqs:{ architecture: true },
	require: {
		skins: 5000,
		piety: 1000 },
	effectText:"Increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
fertilisers: {
	id:"fertilisers",
	name:"Fertilisers",
	prereqs:{ architecture: true },
	require: {
		ore: 5000,
		piety: 1000 },
	effectText:"Increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
masonry: {
	id:"masonry",
	name:"Masonry",
	require: {
		wood: 100,
		stone: 100 },
	effectText:"Unlock more buildings and upgrades" 
},
construction: {
	id:"construction",
	name:"Construction",
	prereqs:{ masonry: true },
	require: {
		wood: 1000,
		stone: 1000 },
	effectText:"Unlock more buildings and upgrades" 
},
architecture: {
	id:"architecture",
	name:"Architecture",
	prereqs:{ construction: true },
	require: {
		wood: 10000,
		stone: 10000 },
	effectText:"Unlock more buildings and upgrades" 
},
tenements: {
	id:"tenements",
	name:"Tenements",
	prereqs:{ construction: true },
	require: {
		food: 200,
		wood: 500,
		stone: 500 },
	effectText:"Houses support +2 workers",
	onGain: function() { updatePopulation(); } //due to population limits changing
},
slums: {
	id:"slums",
	name:"Slums",
	prereqs:{ architecture: true },
	require: {
		food: 500,
		wood: 1000,
		stone: 1000 },
	effectText:"Houses support +2 workers",
	onGain: function() { updatePopulation(); } //due to population limits changing
},
granaries: {
	id:"granaries",
	name:"Granaries",
	prereqs:{ masonry: true },
	require: {
		wood: 1000,
		stone: 1000 },
	effectText:"Barns store double the amount of food",
	onGain: function() { updateResourceTotals(); } //due to resource limits increasing
},
palisade: {
	id:"palisade",
	name:"Palisade",
	prereqs:{ construction: true },
	require: {
		wood: 2000,
		stone: 1000 },
	effectText:"Enemies do less damage" 
},
weaponry: {
	id:"weaponry",
	name:"Basic Weaponry",
	prereqs:{ masonry: true },
	require: {
		wood: 500,
		metal: 500 },
	effectText:"Improve soldiers",
	onGain: function() { 
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
		efficiency.soldiersParty += 0.01;
		efficiency.cavalryParty += 0.01;
	}
},
shields: {
	id:"shields",
	name:"Basic Shields",
	prereqs:{ masonry: true },
	require: {
		wood: 500,
		leather: 500 },
	effectText:"Improve soldiers",
	onGain: function() { 
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
		efficiency.soldiersParty += 0.01;
		efficiency.cavalryParty += 0.01;
	}
},
horseback: {
	id:"horseback",
	name:"Horseback Riding",
	prereqs:{ masonry: true },
	require: {
		food: 500,
		wood: 500 },
	effectText:"Build stables" 
},
wheel: {
	id:"wheel",
	name:"The Wheel",
	prereqs:{ masonry: true },
	require: {
		wood: 500,
		stone: 500 },
	effectText:"Build mills" 
},
writing: {
	id:"writing",
	name:"Writing",
	prereqs:{ masonry: true },
	require: {
		skins: 500 },
	effectText:"Increase cleric piety generation" 
},
administration: {
	id:"administration",
	name:"Administration",
	prereqs:{ writing: true },
	require: {
		stone: 1000,
		skins: 1000 },
	effectText:"Increase land gained from raiding" 
},
codeoflaws: {
	id:"codeoflaws",
	name:"Code of Laws",
	prereqs:{ writing: true },
	require: {
		stone: 1000,
		skins: 1000 },
	effectText:"Reduce unhappiness caused by overcrowding" 
},
mathematics: {
	id:"mathematics",
	name:"Mathematics",
	prereqs:{ writing: true },
	require: {
		herbs: 1000,
		piety: 1000 },
	effectText:"Create siege engines" 
},
aesthetics: {
	id:"aesthetics",
	name:"Aesthetics",
	prereqs:{ writing: true },
	require: { piety: 5000 },
	effectText:"Building temples increases happiness" 
},
civilservice: {
	id:"civilservice",
	name:"Civil Service",
	prereqs:{ architecture: true },
	require: { piety: 5000 },
	effectText:"Increase basic resources from clicking" 
},
feudalism: {
	id:"feudalism",
	name:"Feudalism",
	prereqs:{ civilservice: true },
	require: { piety: 10000 },
	effectText:"Further increase basic resources from clicking" 
},
guilds: {
	id:"guilds",
	name:"Guilds",
	prereqs:{ civilservice: true },
	require: { piety: 10000 },
	effectText:"Increase special resources from clicking" 
},
serfs: {
	id:"serfs",
	name:"Serfs",
	prereqs:{ civilservice: true },
	require: { piety: 20000 },
	effectText:"Unemployed workers increase resources from clicking" 
},
nationalism: {
	id:"nationalism",
	name:"Nationalism",
	prereqs:{ civilservice: true },
	require: { piety: 50000 },
	effectText:"Soldiers increase basic resources from clicking" 
},
worship: { 
	id:"worship", 
	name:"Worship", 
	prereqs:{ temple: 1 },
	require: { piety: 1000 },
	effectText:"Begin worshipping a deity",
	onGain: function() {
		updateUpgrades();
		renameDeity(); //Need to add in some handling for when this returns NULL.
	}
},
lure: {
	id:"lure",
	name:"Lure of Civilisation",
	prereqs:{ deity: "Cats", devotion: 10 },
	require: { piety: 1000 },
	effectText:"increase chance to get cats"
},
companion: {
	id:"companion",
	name:"Warmth of the Companion",
	prereqs:{ deity: "Cats", devotion: 30 },
	require: { piety: 1000 },
	effectText:"cats help heal the sick"
},
comfort: {
	id:"comfort",
	name:"Comfort of the Hearthfires",
	prereqs:{ deity: "Cats", devotion: 50 },
	require: { piety: 5000 },
	effectText:"traders marginally more frequent"
},
blessing: {
	id:"blessing",
	name:"Blessing of Abundance",
	prereqs:{ deity: "the Fields", devotion: 10 },
	require: { piety: 1000 },
	effectText:"increase farmer food output",
	onGain: function() { efficiency.farmers += 0.1; }
},
waste: {
	id:"waste",
	name:"Abide No Waste",
	prereqs:{ deity: "the Fields", devotion: 30 },
	require: { piety: 1000 },
	effectText:"workers will eat corpses if there is no food left"
},
stay: {
	id:"stay",
	name:"Stay With Us",
	prereqs:{ deity: "the Fields", devotion: 50 },
	require: { piety: 5000 },
	effectText:"traders stay longer"
},
riddle: {
	id:"riddle",
	name:"Riddle of Steel",
	prereqs:{ deity: "Battle", devotion: 10 },
	require: { piety: 1000 },
	effectText:"improve soldiers",
	onGain: function() { 
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
		efficiency.soldiersParty += 0.01;
		efficiency.cavalryParty += 0.01;
	}
},
throne: {
	id:"throne",
	name:"Throne of Skulls",
	prereqs:{ deity: "Battle", devotion: 30 },
	require: { piety: 1000 },
	effectText:"slaying enemies creates temples"
},
lament: {
	id:"lament",
	name:"Lament of the Defeated",
	prereqs:{ deity: "Battle", devotion: 50 },
	require: { piety: 5000 },
	effectText:"Successful raids delay future invasions"
},
book: {
	id:"book",
	name:"The Book of the Dead",
	// underworld
	prereqs:{ deity: "the Underworld", devotion: 10 },
	require: { piety: 1000 },
	effectText:"gain piety with deaths"
},
feast: {
	id:"feast",
	name:"A Feast for Crows",
	// underworld
	prereqs:{ deity: "the Underworld", devotion: 30 },
	require: { piety: 1000 },
	effectText:"corpses are less likely to cause illness"
},
secrets: {
	id:"secrets",
	name:"Secrets of the Tombs",
	// underworld
	prereqs:{ deity: "the Underworld", devotion: 50 },
	require: { piety: 5000 },
	effectText:"graveyards increase cleric piety generation"
},

standard: { 
	id:"standard", 
	name:"Battle Standard", 
	require: { // Barracks
		leather: 1000, 
		metal: 1000 },
	effectText:"Lets you build an army"
},
trade: { 
	id:"trade", 
	name:"Trade", 
	require: { gold: 1 }, 
	effectText:"Open the trading post"
},
currency: { 
	id:"currency", 
	name:"Currency", 
	require: { 
		ore: 1000, 
		gold: 10 }, 
	effectText:"Traders arrive more frequently, stay longer"
},
commerce: { 
	id:"commerce", 
	name:"Commerce", 
	require: { 
		piety: 10000, 
		gold: 100 }, 
	effectText:"Traders arrive more frequently, stay longer"
} };


// Initialize Data
var civName = "Woodstock",
rulerName = "Orteil";
food = {
	id:"food",
	name:"food",
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
};
wood = {
	id:"wood",
	name:"wood",
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
};
stone = {
	id:"stone",
	name:"stone",
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
};
var skins = {
	id:"skins",
	name:"skins",
	total:0
},
herbs = {
	id:"herbs",
	name:"herbs",
	total:0
},
ore = {
	id:"ore",
	name:"ore",
	total:0
},
leather = {
	id:"leather",
	name:"leather",
	total:0
},
metal = {
	id:"metal",
	name:"metal",
	total:0
},
piety = {
	id:"piety",
	name:"piety",
	total:0
},
gold = {
	id:"gold",
	name:"gold",
	total:0
},
corpses = {
	id:"corpses",
	name:"corpses",
	total:0
},
devotion = {
	id:"devotion",
	name:"devotion",
	total:0
},
land = 1000,
totalBuildings = 0,
tent = {
	id:"tent",
	name:"tent",
	plural:"tents",
	total:0,
	require:{
		wood:2,
		skins:2
	},
	effectText:"+1 max pop."
},
whut = {
	id:"whut",
	name:"wooden hut",
	plural:"wooden huts",
	total:0,
	require:{
		wood:20,
		skins:1
	},
	effectText:"+3 max pop."
},
cottage = {
	id:"cottage",
	name:"cottage",
	plural:"cottages",
	total:0,
	prereqs:{ masonry: true },
	require:{
		wood:10,
		stone:30
	},
	effectText:"+6 max pop."
},
house = {
	id:"house",
	name:"house",
	plural:"houses",
	total:0,
	prereqs:{ construction: true },
	require:{
		wood:30,
		stone:70
	},
	effectText:"+10 max pop."
},
mansion = {
	id:"mansion",
	name:"mansion",
	plural:"mansions",
	total:0,
	prereqs:{ architecture: true },
	require:{
		wood:200,
		stone:200,
		leather:20
	},
	effectText:"+50 max pop."
},
barn = {
	id:"barn",
	name:"barn",
	plural:"barns",
	total:0,
	require:{
		wood:100
	},
	effectText:"store +200 food"
},
woodstock = {
	id:"woodstock",
	name:"wood stockpile",
	plural:"wood stockpiles",
	total:0,
	require:{
		wood:100
	},
	effectText:"store +200 wood"
},
stonestock = {
	id:"stonestock",
	name:"stone stockpile",
	plural:"stone stockpiles",
	total:0,
	require:{
		wood:100
	},
	effectText:"store +200 stone"
},
tannery = {
	id:"tannery",
	name:"tannery",
	plural:"tanneries",
	total:0,
	prereqs:{ masonry: true },
	require:{
		wood:30,
		stone:70,
		skins:2
	},
	effectText:"allows 1 tanner"
},
smithy = {
	id:"smithy",
	name:"smithy",
	plural:"smithies",
	total:0,
	prereqs:{ masonry: true },
	require:{
		wood:30,
		stone:70,
		ore:2
	},
	effectText:"allows 1 blacksmith"
},
apothecary = {
	id:"apothecary",
	name:"apothecary",
	plural:"apothecaries",
	total:0,
	prereqs:{ masonry: true },
	require:{
		wood:30,
		stone:70,
		herbs:2
	},
	effectText:"allows 1 healer"
},
temple = {
	id:"temple",
	name:"temple",
	plural:"temples",
	prereqs:{ masonry: true },
	total:0,
	require:{
		wood:30,
		stone:120
	},
	effectText:"allows 1 cleric"
},
barracks = {
	id:"barracks",
	name:"barracks",
	plural:"barracks",
	total:0,
	prereqs:{ masonry: true },
	require:{
		food:20,
		wood:60,
		stone:120,
		metal:10
	},
	effectText:"allows 10 soldiers"
},
stable = {
	id:"stable",
	name:"stable",
	plural:"stables",
	total:0,
	prereqs:{ horseback: true },
	require:{
		food:60,
		wood:60,
		stone:120,
		leather:10
	},
	effectText:"allows 10 cavalry"
},
mill = {
	id:"mill",
	name:"mill",
	plural:"mills",
	total:0,
	prereqs:{ wheel: true },
	require:{
		wood:100,
		stone:100
	},
	effectText:"improves farmers"
},
graveyard = {
	id:"graveyard",
	name:"graveyard",
	plural:"graveyards",
	total:0,
	require:{
		wood:50,
		stone:200,
		herbs:50
	},
	effectText:"contains 100 graves"
},
fortification = {
	id:"fortification",
	name:"fortification",
	plural:"fortifications",
	total:0,
	prereqs:{ architecture: true },
	require:{
		stone:100
	},
	effectText:"helps protect against attack"
};

var units = {
unemployed: {
	id:"unemployed",
	name:"unemployed",
	singular:"unemployed",
	alignment:"player",
	effectText:"Unassigned Workers"
},
sick: {
	id:"totalSick",
	name:"sick",
	singular:"sick",
	effectText:"Sick workers"
},
farmers: {
	id:"farmers",
	name:"farmers",
	singular:"farmer",
	alignment:"player",
	source:"unemployed",
	effectText:"Automatically gather food"
},
woodcutters: {
	id:"woodcutters",
	name:"woodcutters",
	singular:"woodcutter",
	alignment:"player",
	source:"unemployed",
	effectText:"Automatically gather wood"
},
miners: {
	id:"miners",
	name:"miners",
	singular:"miner",
	alignment:"player",
	source:"unemployed",
	effectText:"Automatically gather stone"
},
tanners: {
	id:"tanners",
	name:"tanners",
	singular:"tanner",
	alignment:"player",
	source:"unemployed",
	prereqs:{ tannery: 1 },
	effectText:"Convert skins to leather"
},
blacksmiths: {
	id:"blacksmiths",
	name:"blacksmiths",
	singular:"blacksmith",
	alignment:"player",
	source:"unemployed",
	prereqs:{ smithy: 1 },
	effectText:"Convert ore to metal"
},
healers: {
	id:"healers",
	name:"healers",
	singular:"healer",
	alignment:"player",
	source:"unemployed",
	prereqs:{ apothecary: 1 },
	effectText:"Cure sick workers"
},
clerics: {
	id:"clerics",
	name:"clerics",
	singular:"cleric",
	alignment:"player",
	source:"unemployed",
	prereqs:{ temple: 1 },
	effectText:"Generate piety, bury corpses"
},
labourers: {
	id:"labourers",
	name:"labourers",
	singular:"labourer",
	alignment:"player",
	source:"unemployed",
	effectText:"Use resources to build wonder"
},
soldiers: {
	id:"soldiers",
	name:"soldiers",
	singular:"soldier",
	alignment:"player",
	source:"unemployed",
	prereqs:{ barracks: 1 },
	require:{
		leather:10,
		metal:10
	},
	effectText:"Protect from attack"
},
cavalry: {
	id:"cavalry",
	name:"cavalry",
	singular:"cavalry",
	alignment:"player",
	source:"unemployed",
	prereqs:{ stable: 1 },
	require:{
		food:20,
		leather:20
	},
	effectText:"Protect from attack"
},
shades: {
	id:"shades",
	name:"shades",
	singular:"shade",
	alignment:"player",
	effectText:"Insubstantial spirits"
},
wolves: {
	id:"wolves",
	name:"wolves",
	singular:"wolf",
	alignment:"animal",
	onWin: function() { doSlaughter(this); },
	killFatigue:(1.0), // Max fraction that leave after killing the last person
	killExhaustion:(1/2) // Chance of an attacker leaving after killing a person
},
bandits: {
	id:"bandits",
	name:"bandits",
	singular:"bandit",
	alignment:"mob",
	onWin: function() { doLoot(this); },
	lootFatigue:(1/8) // Max fraction that leave after cleaning out a resource
},
barbarians: {
	id:"barbarians",
	name:"barbarians",
	singular:"barbarian",
	alignment:"mob",
	onWin: function() { doHavoc(this); },
	lootFatigue:(1/24), // Max fraction that leave after cleaning out a resource
	killFatigue:(1/3), // Max fraction that leave after killing the last person
	killExhaustion:(1.0) // Chance of an attacker leaving after killing a person
},
esiege: {
	id:"esiege",
	name:"siege engines",
	singular:"Siege Engine",
	alignment:"mob"
},
soldiersParty: {
	id:"soldiersParty",
	name:"soldiers",
	singular:"soldier",
	alignment:"player",
	source:"soldiers",
	prereqs:{ standard: true, barracks: 1 }
},
cavalryParty: {
	id:"cavalryParty",
	name:"cavalry",
	singular:"cavalry",
	alignment:"player",
	source:"cavalry",
	prereqs:{ standard: true, stable: 1 }
},
siege: {
	id:"siege",
	name:"siege engines",
	singular:"Siege Engine",
	alignment:"player",
	prereqs:{ standard: true, mathematics: true },
	require:{
		wood:200,
		leather:50,
		metal:50
	}
},
esoldiers: {
	id:"esoldiers",
	name:"soldiers",
	singular:"soldier",
	alignment:"mob"
},
ecavalry: { // Not currently used.
	id:"ecavalry",
	name:"cavalry",
	singular:"cavalry",
	alignment:"mob"
},
eforts: {
	id:"eforts",
	name:"fortifications",
	singular:"fortification",
	alignment:"mob"
}
};

function getJobSingular(job) { return units[job].singular; }

// Some attackers get a damage mod against some defenders
//xxx This is too fragile; the unit definitions should be expanded with
// categories, and this method rewritten using those categories instead
// of specific unit types.
function getCasualtyMod(attacker,defender)
{
	if ((defender == "cavalry" || defender == "cavalryParty") && (attacker != "wolves"))
	{
		return 1.50; // Cavalry take 50% more casualties vs infantry
	}

	return 1.0; // Otherwise no modifier
}


var battleAltar = {
	id:"battleAltar",
	name:"battle altar",
	plural:"battle altars",
	total:0,
	devotion:1,
	prereqs:{ deity: "Battle" },
	require:{
		stone:200,
		metal:50,
		piety:200
	}
},
fieldsAltar = {
	id:"fieldsAltar",
	name:"fields altar",
	plural:"fields altars",
	total:0,
	devotion:1,
	prereqs:{ deity: "the Fields" },
	require:{
		food:500,
		wood:500,
		stone:200,
		piety:200
	}
},
underworldAltar = {
	id:"underworldAltar",
	name:"underworld altar",
	plural:"underworld altars",
	total:0,
	devotion:1,
	prereqs:{ deity: "the Underworld" },
	require:{
		stone:200,
		piety:200,
		corpses:1
	}
},
catAltar = {
	id:"catAltar",
	name:"cat altar",
	plural:"cat altars",
	total:0,
	devotion:1,
	prereqs:{ deity: "Cats" },
	require:{
		stone:200,
		herbs:100,
		piety:200
	}
},
wonder = {
	total:0,
	food:0,
	wood:0,
	stone:0,
	skins:0,
	herbs:0,
	ore:0,
	leather:0,
	metal:0,
	piety:0,
	array:[],
	name:"",
	building:false,
	completed:false,
	progress:0
};
population = {
	current:0,
	cap:0,
	cats:0,
	zombies:0,
	graves:0,
	unemployed:0,
	farmers:0,
	woodcutters:0,
	miners:0,
	tanners:0,
	blacksmiths:0,
	healers:0,
	clerics:0,
	labourers:0,
	soldiers:0,
	soldiersCas:0,
	cavalry:0,
	cavalryCas:0,
	soldiersParty:0,
	soldiersPartyCas:0,
	cavalryParty:0,
	cavalryPartyCas:0,
	siege:0,
	esoldiers:0,
	esoldiersCas:0,
	eforts:0,
	healthy:0,
	totalSick:0,
	unemployedIll:0,
	farmersIll:0,
	woodcuttersIll:0,
	minersIll:0,
	tannersIll:0,
	blacksmithsIll:0,
	healersIll:0,
	clericsIll:0,
	labourersIll:0,
	soldiersIll:0,
	soldiersCasIll:0,
	cavalryIll:0,
	cavalryCasIll:0,
	wolves:0,
	wolvesCas:0,
	bandits:0,
	banditsCas:0,
	barbarians:0,
	barbariansCas:0,
	esiege:0,
	enemiesSlain:0,
	shades:0
};
efficiency = {
	happiness:1,
	farmers:0.2,
	pestBonus:0,
	woodcutters:0.5,
	miners:0.2,
	tanners:0.5,
	blacksmiths:0.5,
	healers:0.1,
	clerics:0.05,
	soldiers:0.05,
	cavalry:0.08,
	soldiersParty:0.05,
	cavalryParty:0.08,
	siege:0.1, //each siege engine has 10% to hit
	wolves:0.05,
	bandits:0.07,
	barbarians:0.09,
	esoldiers:0.05,
	esiege:0.1, //each siege engine has 10% to hit
	eforts:0.01, // -1% damage
	fortification:0.01,
	palisade:0.01 // Subtracted from attacker efficiency.
};
upgrades = {
	domestication:false,
	ploughshares:false,
	irrigation:false,
	skinning:false,
	harvesting:false,
	prospecting:false,
	butchering:false,
	gardening:false,
	extraction:false,
	croprotation:false,
	selectivebreeding:false,
	fertilisers:false,
	masonry:false,
	construction:false,
	architecture:false,
	wheel:false,
	horseback:false,
	tenements:false,
	slums:false,
	granaries:false,
	palisade:false,
	weaponry:false,
	shields:false,
	writing:false,
	administration:false,
	codeoflaws:false,
	mathematics:false,
	aesthetics:false,
	civilservice:false,
	feudalism:false,
	guilds:false,
	serfs:false,
	nationalism:false,
	flensing:false,
	macerating:false,
	standard:false,
	worship:false,
	deityType:0,
	lure:false,
	companion:false,
	comfort:false,
	blessing:false,
	waste:false,
	stay:false,
	riddle:false,
	throne:false,
	lament:false,
	book:false,
	feast:false,
	secrets:false,
	trade:false,
	currency:false,
	commerce:false
};
var deity = {
	name:"",
	type:"",
	seniority:1,
	battle:0,
	fields:0,
	underworld:0,
	cats:0
},
achievements = {
	hamlet:0,
	village:0,
	smallTown:0,
	largeTown:0,
	smallCity:0,
	largeCity:0,
	metropolis:0,
	smallNation:0,
	nation:0,
	largeNation:0,
	empire:0,
	raider:0,
	engineer:0,
	domination:0,
	hated:0,
	loved:0,
	cat:0,
	glaring:0,
	clowder:0,
	battle:0,
	cats:0,
	fields:0,
	underworld:0,
	fullHouse:0,
	plague:0,
	ghostTown:0,
	wonder:0,
	seven:0,
	merchant:0,
	rushed:0,
	neverclick:0
},
trader = {
	material:false,
	requested:0,
	timer:0
},
civType = "Thorp",
targetMax = "thorp",
raiding = {
	raiding:false,
	victory:false,
	iterations:0,
	last:""
},
oldDeities = "",
deityArray = [],
resourceClicks = 0,
attackCounter = 0,
tradeCounter = 0,
throneCount = 0,
pestTimer = 0,
gloryTimer = 0,
cureCounter = 0,
graceCost = 1000,
walkTotal = 0,
autosave = true,
autosaveCounter = 1,
customIncrements = false,
usingWords = false,
worksafe = false,
size = 1,
body = document.getElementsByTagName("body")[0];


// Get an object's requirements in text form.
// Pass it a cost object.
// DOES NOT WORK for nonlinear building cost buildings!
//xxx Also only works for resource or building requirements, not units.
function getReqText(costObj)
{
	var i, num;
	var text = "";
	for(i in costObj)
	{
		num = costObj[i];
		if (num == 0) { continue; }
		if (text != "") { text += ", "; }
		text += prettify(Math.round(num)) + " " + window[i].name;
	}

	return text;
}

// Returns when the player meets the given upgrade prereqs.
function meetsPrereqs(prereqObj)
{
	if (!isValid(prereqObj)) { prereqObj = {}; }
	var i;
	for(i in prereqObj)
	{
		//xxx HACK:  Ugly special checks for non-upgrade pre-reqs.
		// This should be simplified/eliminated once the resource
		// system is unified.
		if (i === "deity") { // Deity
			if (deity.type != prereqObj[i]) { return false; }
		} else if (isValid(window[i]) && isValid(window[i].total)) { // Resource/Building
			if (window[i].total < prereqObj[i]) { return false; }
		} else if (isValid(upgrades[i])) { // Upgrade
			if (upgrades[i] != prereqObj[i] ) { return false; }
		}
	}

	return true;
}


// Returns how many of this item the player can afford.
// DOES NOT WORK for nonlinear building cost buildings!
function canAfford(costObj)
{
	if (!isValid(costObj)) { costObj = {}; }
	var i, num = Infinity;
	for(i in costObj)
	{
		if (costObj[i] == 0) { continue; }
		num = Math.min(num,Math.floor(window[i].total/costObj[i]));
		if (num == 0) { return num; }
	}

	return num;
}
// Tries to pay for the specified number of the given cost object.
// Pays for fewer if the whole amount cannot be paid.
// Return the number that could be afforded.
// DOES NOT WORK for nonlinear building cost buildings!
function payFor(costObj, num)
{
	var i;
	if (num === undefined) { num = 1; } // default to 1

	num = Math.min(num,canAfford(costObj));
	if (num == 0) { return 0; }

	for(i in costObj)
	{
		window[i].total -= costObj[i] * num;
	}

	return num;
}

// job - The job ID to update
// num - Maximum limit to hire/fire (use -Infinity find the max fireable)
// Returns the number that could be hired or fired (negative if fired).
function canHire(job,num)
{
	var buildingLimit = Infinity; // Additional limit from buildings.

	if (num === undefined) { num = Infinity; } // Default to as many as we can.
	num = Math.min(num, population.unemployed);  // Cap hiring by # of available workers.
	num = Math.max(num, -population[job]);  // Cap firing by # in that job.
	
	// See if this job has limits from buildings or resource costs.
	if (job == "tanners")     { buildingLimit =    tannery.total; }
	if (job == "blacksmiths") { buildingLimit =    smithy.total; }
	if (job == "healers")     { buildingLimit =    apothecary.total; }
	if (job == "clerics")     { buildingLimit =    temple.total; }
	if (job == "soldiers")    { buildingLimit = 10*barracks.total; }
	if (job == "cavalry")     { buildingLimit = 10*stable.total; }

	// Check the building limit against the current numbers (including sick and
	// partied units, if applicable).
	num = Math.min(num, buildingLimit - population[job] - population[job+"Ill"] 
	    - (isValid(population[job+"Party"]) ? population[job+"Party"] : 0) );

	// See if we can afford them; returns fewer if we can't afford them all
	return Math.min(num,canAfford(units[job].require));
}

// Interface initialization code

// Much of this interface consists of tables of buttons, columns of which get
// revealed or hidden based on toggles and population.  Currently, we do this
// by setting the "display" property on every affected <td>.  This is very
// inefficient, because it forces a table re-layout after every cell change.
//
// A better approach tried but ultimately abandoned was to use <col> elements
// to try to manipulate the columns wholesale.  Unfortunately, <col> is
// minimally useful, because only a few CSS properties are supported on <col>.
// Even though one of those, "visibility", purports to have the "collapse" 
// value for just this purpose, it doesn't work; brower support for this
// property is very inconsistent, particularly in the handling of cell borders.
//
// Eventually, I hope to implement dynamic CSS rules, so that I can restyle 
// lots of elements at once.


// Pass this the building definition object.
// Also pass 'true' to only generate the x1 button (for mills and fortifications)
// Or pass nothing, to create a blank row.
function getBuildingRowText(buildingObj, onlyOnes)
{
	if (buildingObj===null || buildingObj===undefined) { return "<tr><td colspan='8'/>&nbsp;</tr>"; }

	var bldId = buildingObj.id;
	var bldName = buildingObj.name;
	var s = "<tr id='"+bldId+"Row'>";
	// Note that updateBuildingRow() relies on the <tr>'s children being in this particular layout.
	s += "<td><button class='build' onmousedown=\"createBuilding("+bldId+",1)\">Build "+bldName+"</button></td>";
	if (onlyOnes===undefined || onlyOnes !== true) {
	s += "<td class='building10'><button class='x10' onmousedown=\"createBuilding("+bldId+",10)\">x10</button></td>";
	s += "<td class='building100'><button class='x100' onmousedown=\"createBuilding("+bldId+",100)\">x100</button></td>";
	s += "<td class='building1000'><button class='x1000' onmousedown=\"createBuilding("+bldId+",1000)\">x1k</button></td>";
	s += "<td class='buildingCustom'><button onmousedown=\"createBuilding("+bldId+",'custom')\">+Custom</button></td>";
	}
	else {
	s += "<td class='building10'></td><td class='building100'></td>" +
	     "<td class='building1000'></td><td class='buildingCustom'></td>";
	}
	s += "<td class='buildingnames'>"+buildingObj.plural+": </td>";
	s += "<td class='number'><span data-action='display' data-target='"+bldId+"'>0</span></td>";
	s += "<td><span id='"+bldId+"Cost'class='cost'>";
	if (isValid(buildingObj.require)) { s += getReqText(buildingObj.require); }
	s += "</span><span class='note'>: ";
	if (isValid(buildingObj.effectText)) { s += buildingObj.effectText; }
	s += "</span></td>";
	s += "</tr>";
	return s;
}
// Dynamically create the building controls table.
function addBuildingRows()
{
	document.getElementById("buildings").innerHTML += 
		  getBuildingRowText(tent)
		+ getBuildingRowText(whut)
		+ getBuildingRowText(cottage)
		+ getBuildingRowText(house)
		+ getBuildingRowText(mansion)
		+ getBuildingRowText()
		+ getBuildingRowText(barn)
		+ getBuildingRowText(woodstock)
		+ getBuildingRowText(stonestock)
		+ getBuildingRowText()
		+ getBuildingRowText(tannery)
		+ getBuildingRowText(smithy)
		+ getBuildingRowText(apothecary)
		+ getBuildingRowText(temple)
		+ getBuildingRowText(barracks)
		+ getBuildingRowText(stable)
		+ getBuildingRowText()
		+ getBuildingRowText(graveyard)
		+ getBuildingRowText(mill,true)
		+ getBuildingRowText(fortification,true);
}

function updateBuildingRow(buildingObj){
	var i;
	//this works by trying to access the children of the table rows containing the buttons in sequence
	var numBuildable = canAfford(buildingObj.require);
	var buildingRow = document.getElementById(buildingObj.id + "Row");

	// Reveal the row if prereqs are met
	//xxx We don't hide it again if the prereq is later unmet, because we don't want to orphan workers.
	if (meetsPrereqs(buildingObj.prereqs)) { setElemDisplay(buildingRow,true); }

	for (i=0;i<4;i++){
		try { // try-catch required because fortifications, mills, and altars do not have more than one child button. 
		      // This should probably be cleaned up in the future.
		      // Fortunately the index numbers of the children map directly onto the powers of 10 used by the buttons
				buildingRow.children[i].children[0].disabled = (numBuildable < Math.pow(10,i));
		} catch(ignore){}
	}		
	try { buildingRow.children[4].children[0].disabled = (numBuildable < 1); } catch(ignore){} //Custom button
}
function updateBuildingButtons(){
	var i;
	//enables/disabled building buttons - calls each type of building in turn
	var buildingList = [tent,whut,cottage,house,mansion,barn,woodstock,stonestock,
						tannery,smithy,apothecary,temple,barracks,stable,graveyard,mill,
						fortification,battleAltar,fieldsAltar,catAltar];

	for (i=0;i<buildingList.length;++i) { updateBuildingRow(buildingList[i]); }
}


// Pass this the job definition object.
// Also pass 'true' to only generate the x1 buttons 
// Or pass nothing, to create a blank row.
function getJobRowText(jobObj, onlyOnes, funcName, displayClass, allowSell)
{
	if (jobObj===null || jobObj===undefined) { return "<tr><td colspan='13'/>&nbsp;</tr>"; }
	if (onlyOnes===undefined) { onlyOnes = false; }
	if (funcName===undefined) { funcName = "hire"; }
	if (displayClass===undefined) { displayClass = "job"; }
	if (allowSell===undefined) { allowSell = true; }

	var jobId = jobObj.id;
	var s = "<tr id='"+jobId+"Row'>";
	// Note that updateJobRow() relies on the <tr>'s children being in this particular layout.
	if (!onlyOnes && funcName && allowSell) {
	s += "<td class='jobNone'><button onmousedown=\""+funcName+"('"+jobId+"',-Infinity)\">-All</button></td>";
	s += "<td class='jobCustom'><button onmousedown=\""+funcName+"('"+jobId+"','-custom')\">-Custom</button></td>";
	s += "<td class='job100'><button onmousedown=\""+funcName+"('"+jobId+"',-100)\">x100</button></td>";
	s += "<td class='job10'><button onmousedown=\""+funcName+"('"+jobId+"',-10)\">x10</button></td>";
	} else {
	s += "<td class='jobNone'></td><td class='jobCustom'></td>" +
	     "<td class='job100'></td><td class='job10'></td>";
	}
	if (funcName && allowSell) {
	s += "<td><button onmousedown=\""+funcName+"('"+jobId+"',-1)\">&lt;</button></td>";
	} else {
	s += "<td></td>";
	}
	s += "<td class='"+displayClass+"'>"+jobObj.name+": </td>";
	s += "<td class='number'><span data-action='display_pop' data-target='"+jobId+"'>0</span></td>";
	if (funcName) {
	s += "<td><button onmousedown='"+funcName+"(\""+jobId+"\",1)'>&gt;</button></td>";
	} else {
	s += "<td></td>";
	}
	if (!onlyOnes && funcName) {
	s += "<td class='job10'><button onmousedown=\""+funcName+"('"+jobId+"',10)\">x10</button></td>";
	s += "<td class='job100'><button onmousedown=\""+funcName+"('"+jobId+"',100)\">x100</button></td>";
	s += "<td class='jobCustom'><button onmousedown=\""+funcName+"('"+jobId+"','custom')\">+Custom</button></td>";
	s += "<td class='jobAll'>";
	// Don't allow 'Max' on things we can't sell back.
	if (allowSell) { s += "<button onmousedown=\""+funcName+"('"+jobId+"',Infinity)\">Max</button></td>"; }
	s += "</td>";
	} else {
	s += "<td class='job10'></td><td class='job100'></td>" +
	     "<td class='jobCustom'></td><td class='jobAll'></td>";
	}
	s += "<td><span id='"+jobId+"Cost' class='cost'>";
	if (isValid(jobObj.require)) { s += getReqText(jobObj.require); }
	s += "</span><span class='note'>";
	if (isValid(jobObj.require) && isValid(jobObj.effectText)) { s += ": "; }
	if (isValid(jobObj.effectText)) { s += jobObj.effectText; }
	s += "</span></td>";
	s += "</tr>";
	return s;
}
// Dynamically create the job controls table.
function addJobRows()
{
	document.getElementById("jobs").innerHTML += 
		  getJobRowText(units.unemployed,false,null,"job")
		+ getJobRowText(units.sick,false,null,"job")
		+ getJobRowText(units.farmers)
		+ getJobRowText(units.woodcutters)
		+ getJobRowText(units.miners)
		+ getJobRowText(units.tanners)
		+ getJobRowText(units.blacksmiths)
		+ getJobRowText(units.healers)
		+ getJobRowText(units.clerics)
		+ getJobRowText(units.labourers)
		+ getJobRowText(units.soldiers)
		+ getJobRowText(units.cavalry)
		+ getJobRowText(units.shades,false,null,"job")
		+ getJobRowText(units.wolves,false,null,"enemy")
		+ getJobRowText(units.bandits,false,null,"enemy")
		+ getJobRowText(units.barbarians,false,null,"enemy")
		+ getJobRowText(units.esiege,false,null,"enemy");
}

// job - The job ID to update
function updateJobButtons(job){

	var elem = document.getElementById(job + "Row");

	// Reveal the row if prereqs are met
	//xxx We don't hide it again if the prereq is later unmet, because we don't want to orphan workers.
	if (meetsPrereqs(units[job].prereqs)) { setElemDisplay(elem,true); }

	var numHire = canHire(job);
	var numFire = -canHire(job,-Infinity);

	elem.children[ 0].children[0].disabled = (numFire <   1); // -   All
	elem.children[ 1].children[0].disabled = (numFire <   1); // -Custom
	elem.children[ 2].children[0].disabled = (numFire < 100); // -   100
	elem.children[ 3].children[0].disabled = (numFire <  10); // -    10
	elem.children[ 4].children[0].disabled = (numFire <   1); // -     1
	elem.children[ 7].children[0].disabled = (numHire <   1); //       1
	elem.children[ 8].children[0].disabled = (numHire <  10); //      10
	elem.children[ 9].children[0].disabled = (numHire < 100); //     100
	elem.children[10].children[0].disabled = (numHire <   1); //  Custom
	elem.children[11].children[0].disabled = (numHire <   1); //     Max
}
function updateJobs(){
	//Update the page with the latest worker distribution and stats
	updateJobButtons("farmers");
	updateJobButtons("woodcutters");
	updateJobButtons("miners");
	updateJobButtons("tanners",tannery);
	updateJobButtons("blacksmiths",smithy);
	updateJobButtons("healers",apothecary);
	updateJobButtons("clerics",temple);
	updateJobButtons("labourers");
	updateJobButtons("soldiers",barracks,10);
	updateJobButtons("cavalry",stable,10);
}


// Dynamically create the Party controls table.
function addPartyRows()
{
	document.getElementById("party").innerHTML += 
		  getJobRowText(units.soldiersParty,false,"party","job")
		+ getJobRowText(units.cavalryParty,false,"party","job")
		+ getJobRowText(units.siege,false,"party","job",false)
		+ getJobRowText(units.esoldiers,false,null,"enemy")
		+ getJobRowText(units.eforts,false,null,"enemy");
}

function updatePartyRow(job) {
	var elem = document.getElementById(job + "Row");
	var pacifist = !upgrades.standard;
	var limit;

	// Reveal the row if prereqs are met
	//xxx We don't hide it again if the prereq is later unmet, because we don't want to orphan workers.
	if (meetsPrereqs(units[job].prereqs)) { setElemDisplay(elem,true); }

	// If we have a designated source, limit to what it can provide.  Otherwise
	// assume no limit.
	limit = (isValid(units[job].source)) ?  population[units[job].source] : Infinity;

	elem.children[ 0].children[0].disabled = pacifist || (population[job] <   1); //    None
	elem.children[ 1].children[0].disabled = pacifist || (population[job] <   1); // -Custom
	elem.children[ 2].children[0].disabled = pacifist || (population[job] < 100); // -   100
	elem.children[ 3].children[0].disabled = pacifist || (population[job] <  10); // -    10
	elem.children[ 4].children[0].disabled = pacifist || (population[job] <   1); // -     1
	elem.children[ 7].children[0].disabled = pacifist || (limit           <   1); //       1
	elem.children[ 8].children[0].disabled = pacifist || (limit           <  10); //      10
	elem.children[ 9].children[0].disabled = pacifist || (limit           < 100); //     100
	elem.children[10].children[0].disabled = pacifist || (limit           <   1); //  Custom
	elem.children[11].children[0].disabled = pacifist || (limit           <   1); //     Max
}

function updatePartyButtons(){
	var elem;
	var pacifist = !upgrades.standard;
	var limit;

	updatePartyRow("soldiersParty");
	updatePartyRow("cavalryParty");

	//xxx This part should be merged with updatePartyRow eventually
	var job = "siege";
	elem = document.getElementById(job+"Row");
	// Reveal the row if prereqs are met
	//xxx We don't hide it again if the prereq is later unmet, because we don't want to orphan workers.
	if (meetsPrereqs(units[job].prereqs)) { setElemDisplay(elem,true); }

	limit = canAfford(units[job].require);
	
	elem.children[ 7].children[0].disabled = pacifist || (limit <   1); //       1
	elem.children[ 8].children[0].disabled = pacifist || (limit <  10); //      10
	elem.children[ 9].children[0].disabled = pacifist || (limit < 100); //     100
	elem.children[10].children[0].disabled = pacifist || (limit <   1); //  Custom
	// Siege max disabled; too easy to overspend.
	// elem.children[11].children[0].disabled = pacifist || (limit <  1); // Max
}
function updateParty(){
	//updates the party (and enemies)
	setElemDisplay(document.getElementById("esoldiersRow"),(population.esoldiers > 0));
	setElemDisplay(document.getElementById("efortsRow"),(population.eforts > 0));
}


function getUpgradeRowText(upgradeObj)
{
	if (upgradeObj===null || upgradeObj===undefined) { return ""; }

	var s = "<span id='"+upgradeObj.id+"Line' class='upgradeLine'>";
	s += "<button id='"+upgradeObj.id+"' onmousedown=\"upgrade('"+upgradeObj.id+"')\">";
	s += upgradeObj.name+"<br />("+getReqText(upgradeObj.require)+")</button>";
	s += "<span class='note'>"+upgradeObj.effectText+"</span><br /></span>";
 
	return s;
}
// Dynamically create the purchased upgrades list.
function addUpgradeRows()
{
	document.getElementById("upgradesPane").innerHTML += 
		  getUpgradeRowText(upgradeData.skinning)
		+ getUpgradeRowText(upgradeData.harvesting)
		+ getUpgradeRowText(upgradeData.prospecting)
		+ getUpgradeRowText(upgradeData.domestication)
		+ getUpgradeRowText(upgradeData.ploughshares)
		+ getUpgradeRowText(upgradeData.irrigation)
		+ getUpgradeRowText(upgradeData.butchering)
		+ getUpgradeRowText(upgradeData.gardening)
		+ getUpgradeRowText(upgradeData.extraction)
		+ getUpgradeRowText(upgradeData.flensing)
		+ getUpgradeRowText(upgradeData.macerating)
		+ getUpgradeRowText(upgradeData.croprotation)
		+ getUpgradeRowText(upgradeData.selectivebreeding)
		+ getUpgradeRowText(upgradeData.fertilisers)
		+ getUpgradeRowText(upgradeData.masonry)
		+ getUpgradeRowText(upgradeData.construction)
		+ getUpgradeRowText(upgradeData.architecture)
		+ getUpgradeRowText(upgradeData.tenements)
		+ getUpgradeRowText(upgradeData.slums)
		+ getUpgradeRowText(upgradeData.granaries)
		+ getUpgradeRowText(upgradeData.palisade)
		+ getUpgradeRowText(upgradeData.weaponry)
		+ getUpgradeRowText(upgradeData.shields)
		+ getUpgradeRowText(upgradeData.horseback)
		+ getUpgradeRowText(upgradeData.wheel)
		+ getUpgradeRowText(upgradeData.writing)
		+ getUpgradeRowText(upgradeData.administration)
		+ getUpgradeRowText(upgradeData.codeoflaws)
		+ getUpgradeRowText(upgradeData.mathematics)
		+ getUpgradeRowText(upgradeData.aesthetics)
		+ getUpgradeRowText(upgradeData.civilservice)
		+ getUpgradeRowText(upgradeData.feudalism)
		+ getUpgradeRowText(upgradeData.guilds)
		+ getUpgradeRowText(upgradeData.serfs)
		+ getUpgradeRowText(upgradeData.nationalism)
		+ "<span id='wonderLine'><br /><button id='startWonder' onmousedown='startWonder()'>"
		+ "Start Building Wonder</button><br /></span>"
		+ "</div>"
		+ "</div>"
		+ "<h3>Purchased Upgrades</h3>"
		+ "<div id='purchased'></div>";

/*xxx Maybe convert these later
		+ getUpgradeRowText(upgradeData.worship)
		+ getUpgradeRowText(upgradeData.standard)
		+ getUpgradeRowText(upgradeData.trade)
		+ getUpgradeRowText(upgradeData.currency)
*/
}

function getPUpgradeRowText(upgradeObj)
{
	if (upgradeObj===null || upgradeObj===undefined) { return ""; }

	var s = "<span id='P"+upgradeObj.id +"'>"
		+"<strong>"+upgradeObj.name+"</strong>"
		+" - "+upgradeObj.effectText+"<br/></span>";
 
	return s;
}
// Dynamically create the purchased upgrades list.
function addPUpgradeRows()
{
	document.getElementById("purchased").innerHTML += 
		  getPUpgradeRowText(upgradeData.skinning)
		+ getPUpgradeRowText(upgradeData.harvesting)
		+ getPUpgradeRowText(upgradeData.prospecting)
		+ getPUpgradeRowText(upgradeData.domestication)
		+ getPUpgradeRowText(upgradeData.ploughshares)
		+ getPUpgradeRowText(upgradeData.irrigation)
		+ getPUpgradeRowText(upgradeData.butchering)
		+ getPUpgradeRowText(upgradeData.gardening)
		+ getPUpgradeRowText(upgradeData.extraction)
		+ getPUpgradeRowText(upgradeData.flensing)
		+ getPUpgradeRowText(upgradeData.macerating)
		+ getPUpgradeRowText(upgradeData.croprotation)
		+ getPUpgradeRowText(upgradeData.selectivebreeding)
		+ getPUpgradeRowText(upgradeData.fertilisers)
		+ getPUpgradeRowText(upgradeData.masonry)
		+ getPUpgradeRowText(upgradeData.construction)
		+ getPUpgradeRowText(upgradeData.architecture)
		+ getPUpgradeRowText(upgradeData.tenements)
		+ getPUpgradeRowText(upgradeData.slums)
		+ getPUpgradeRowText(upgradeData.granaries)
		+ getPUpgradeRowText(upgradeData.palisade)
		+ getPUpgradeRowText(upgradeData.weaponry)
		+ getPUpgradeRowText(upgradeData.shields)
		+ getPUpgradeRowText(upgradeData.horseback)
		+ getPUpgradeRowText(upgradeData.wheel)
		+ getPUpgradeRowText(upgradeData.writing)
		+ getPUpgradeRowText(upgradeData.administration)
		+ getPUpgradeRowText(upgradeData.codeoflaws)
		+ getPUpgradeRowText(upgradeData.mathematics)
		+ getPUpgradeRowText(upgradeData.aesthetics)
		+ getPUpgradeRowText(upgradeData.civilservice)
		+ getPUpgradeRowText(upgradeData.feudalism)
		+ getPUpgradeRowText(upgradeData.guilds)
		+ getPUpgradeRowText(upgradeData.serfs)
		+ getPUpgradeRowText(upgradeData.nationalism)

		+ getPUpgradeRowText(upgradeData.worship)
		+ getPUpgradeRowText(upgradeData.standard)
		+ getPUpgradeRowText(upgradeData.trade)
		+ getPUpgradeRowText(upgradeData.currency)
		+ getPUpgradeRowText(upgradeData.commerce);
}


// Update functions. Called by other routines in order to update the interface.

//xxx Maybe add a function here to look in various locations for vars, so it
//doesn't need multiple action types?
function updateResourceTotals(){
	var i,displayElems,elem,val;

	// Scan the HTML document for elements with a "data-action" element of
	// "display".  The "data-target" of such elements is presumed to contain
	// the global variable name to be displayed as the element's content.
	//xxx This should probably require data-target too.
	displayElems=document.querySelectorAll("[data-action='display']");
	for (i=0;i<displayElems.length;++i)
	{
		elem = displayElems[i];
		elem.innerHTML = prettify(Math.floor(window[dataset(elem,"target")].total));
	}

	// Update net production values for primary resources.  Same as the above,
	// but look for "data-action" == "displayNet".
	displayElems=document.querySelectorAll("[data-action='displayNet']");
	for (i=0;i<displayElems.length;++i)
	{
		elem = displayElems[i];
		val = window[dataset(elem,"target")].net.toFixed(1);
		elem.innerHTML = prettify(val);
		// Colourise net production values.
		if      (val < 0) { elem.style.color="#f00"; }
		else if (val > 0) { elem.style.color="#0b0"; }
		else              { elem.style.color="#000"; }
	}

	if (gold.total >= 1){
		setElemDisplay(document.getElementById("goldRow"),true);
		if (!upgrades.trade) { document.getElementById("trade").disabled = false; }
	}

	//Update page with building numbers, also stockpile limits.
	document.getElementById("maxfood").innerHTML = prettify(200 + (200 * (barn.total + (barn.total * (upgrades.granaries?1:0)))));
	document.getElementById("maxwood").innerHTML = prettify(200 + (200 * woodstock.total));
	document.getElementById("maxstone").innerHTML = prettify(200 + (200 * stonestock.total));

	//Update land values
	totalBuildings = tent.total + whut.total + cottage.total + house.total + mansion.total + barn.total + woodstock.total + stonestock.total + tannery.total + smithy.total + apothecary.total + temple.total + barracks.total + stable.total + mill.total + graveyard.total + fortification.total + battleAltar.total + fieldsAltar.total + underworldAltar.total + catAltar.total;
	document.getElementById("freeLand").innerHTML = prettify(land - Math.round(totalBuildings));
	document.getElementById("totalLand").innerHTML = prettify(land);
	document.getElementById("totalBuildings").innerHTML = prettify(Math.round(totalBuildings));

	//Unlock jobs predicated on having certain buildings
	if (smithy.total > 0) { setElemDisplay(document.getElementById("blacksmithsRow"),true); }
	if (tannery.total > 0) { setElemDisplay(document.getElementById("tannersRow"),true); }
	if (apothecary.total > 0) { setElemDisplay(document.getElementById("healersRow"),true); }
	if (temple.total > 0) { setElemDisplay(document.getElementById("clericsRow"),true); }
	if (barracks.total > 0) { setElemDisplay(document.getElementById("soldiersRow"),true); }
	if (stable.total > 0) { setElemDisplay(document.getElementById("cavalryRow"),true); }

	//Unlock upgrades predicated on having certain buildings

	//At least one Temple is required to unlock Worship (It never disables again once enabled)
	if (temple.total > 0) { setElemDisplay(document.getElementById("deitySelect"),true); }
	document.getElementById("worship").disabled = upgrades.worship ||
		(temple.total < 1) || (piety.total < 1000);

	//At least one Barracks is required to unlock Standard (It never disables again once enabled)
	if (barracks.total > 0) { setElemDisplay(document.getElementById("conquestSelect"),true); }
	document.getElementById("standard").disabled = upgrades.standard ||
		(barracks.total < 1) || (leather.total < 1000) || (metal.total < 1000);

	// Enable trade tab once we've got gold (It never disables again once enabled)
	if (gold.total > 0) { setElemDisplay(document.getElementById("tradeSelect"),true); }

	// Need to have enough resources to trade
	document.getElementById("trade").disabled = (trader.time == 0) ||
		(trader.material.total < trader.requested);

	updatePopulation(); //updatePopulation() handles the population caps, which are determined by buildings.
}

function updatePopulation(){
	var i, elem, elems, displayElems;
	//Update population cap by multiplying out housing numbers
	population.cap = tent.total + (whut.total * 3) + (cottage.total * 6) + (house.total * (10 + ((upgrades.tenements?1:0) * 2) + ((upgrades.slums?1:0) * 2))) + (mansion.total * 50);
	//Update sick workers
	population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.healersIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
	//Display or hide the sick row
	if (population.totalSick > 0){
		setElemDisplay(document.getElementById("totalSickRow"),true);
	}
	//Calculate healthy workers
	population.healthy = population.unemployed + population.farmers + population.woodcutters + population.miners + population.tanners + population.blacksmiths + population.healers + population.clerics + population.soldiers + population.cavalry + population.labourers - population.zombies;
	//Calculate maximum population based on workers that require housing (i.e. not zombies)
	population.current = population.healthy + population.totalSick + population.soldiersParty + population.cavalryParty;
	//Zombie soldiers dying can drive population.current negative if they are killed and zombies are the only thing left.
	if (population.current < 0){
		if (population.zombies > 0){
			//This fixes that by removing zombies and setting to zero.
			population.zombies += population.current;
			population.current = 0;
		} else {
			//something else is wrong
			console.log("Something has gone wrong. Population levels are: " + population.unemployed + ", " + population.farmers + ", " + population.woodcutters + ", " + population.miners + ", " + population.blacksmiths + ", " + population.healers + ", " + population.clerics + ", " + population.soldiers + ", " + population.soldiersParty + ", " + population.cavalry + ", " + population.cavalryParty + ", " + population.labourers);
		}
	}

	//Update page with numbers

	// Scan the HTML document for elements with a "data-action" element of
	// "display_pop".  The "data-target" of such elements is presumed to contain
	// the population subproperty to be displayed as the element's content.
	//xxx This selector should probably require data-target too.
	displayElems=document.querySelectorAll("[data-action='display_pop']");
	for (i=0;i<displayElems.length;++i)
	{
		elem = displayElems[i];
		elem.innerHTML = prettify(Math.floor(population[dataset(elem,"target")]));
	}

	setElemDisplay(document.getElementById("gravesTotal"),(population.graves > 0));

	//As population increases, various things change
	if (population.current == 0 && population.cap >= 1000){
		civType = "Ghost Town";
		if (!achievements.ghostTown){
			gameLog("Achievement Unlocked: Ghost Town");
			achievements.ghostTown = 1;
		}
	}

	// Update our civ type name and score achievement if warranted.
	var civTypeInfo = civSizes.getCivSize(population.current);
	civType = civTypeInfo.name;
	if (achievements.hasOwnProperty(civTypeInfo.id) && !achievements[civTypeInfo.id]) {
		achievements[civTypeInfo.id] = 1;
		gameLog("Achievement Unlocked: " + civTypeInfo.name);
	}

	if (population.zombies >= 1000 && population.zombies >= 2 * population.current){ //easter egg
		civType = "Necropolis";
	}
	document.getElementById("civType").innerHTML = civType;

	//Unlocking interface elements as population increases to reduce unnecessary clicking
	if (population.current + population.zombies >= 10) {
		if (!customIncrements){	
			setElemDisplay(document.getElementById("spawn10"),true);
			elems = document.getElementsByClassName("job10");
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	if (population.current + population.zombies >= 100) {
		if (!customIncrements){
			setElemDisplay(document.getElementById("spawn100"),true);
			elems = document.getElementsByClassName("building10");
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
			elems = document.getElementsByClassName("job100");
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	if (population.current + population.zombies >= 1000) {
		if (!customIncrements){
			setElemDisplay(document.getElementById("spawn1000"),true);
			setElemDisplay(document.getElementById("spawnMax"),true);
			elems = document.getElementsByClassName("building100");
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}

		elems = document.getElementsByClassName("jobAll");
		for(i = 0; i < elems.length; i++) {
			setElemDisplay(elems[i],true);
		}
		elems = document.getElementsByClassName("jobNone");
		for(i = 0; i < elems.length; i++) {
			setElemDisplay(elems[i],true);
		}
	}
	if (population.current + population.zombies >= 10000) {
		if (!customIncrements){
			elems = document.getElementsByClassName("building1000");
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	updateSpawnButtons();
	//Calculates and displays the cost of buying workers at the current population.
	document.getElementById("zombieCost").innerHTML = prettify(Math.round(calcZombieCost(1)));
	document.getElementById("workerCost").innerHTML = prettify(Math.round(calcWorkerCost(1)));
	document.getElementById("workerCost10").innerHTML = prettify(Math.round(calcWorkerCost(10)));
	document.getElementById("workerCost100").innerHTML = prettify(Math.round(calcWorkerCost(100)));
	document.getElementById("workerCost1000").innerHTML = prettify(Math.round(calcWorkerCost(1000)));
	var maxSpawn = Math.min((population.cap - population.current),logSearchFn(calcWorkerCost,food.total));
	document.getElementById("workerNumMax").innerHTML = prettify(Math.round(maxSpawn));
	document.getElementById("workerCostMax").innerHTML = prettify(Math.round(calcWorkerCost(maxSpawn)));
	updateJobs(); //handles the display of individual worker types
	updateMobs(); //handles the display of enemies
	updateParty();
	updateHappiness();
	updateAchievements(); //handles display of achievements
}
function updateSpawnButtons(){
	//Turning on/off buttons based on free space.
	if ((population.current + 1) <= population.cap && food.total >= calcWorkerCost(1)){
		document.getElementById("spawn1").disabled = false;
		document.getElementById("spawnCustomButton").disabled = false;
	} else {
		document.getElementById("spawn1").disabled = true;
		document.getElementById("spawnCustomButton").disabled = true;
	}
	if ((population.current + 10) <= population.cap && food.total >= calcWorkerCost(10)){
		document.getElementById("spawn10button").disabled = false;
	} else {
		document.getElementById("spawn10button").disabled = true;
	}
	if ((population.current + 100) <= population.cap && food.total >= calcWorkerCost(100)){
		document.getElementById("spawn100button").disabled = false;
	} else {
		document.getElementById("spawn100button").disabled = true;
	}
	if ((population.current + 1000) <= population.cap && food.total >= calcWorkerCost(1000)){
		document.getElementById("spawn1000button").disabled = false;
	} else {
		document.getElementById("spawn1000button").disabled = true;
	}
	if ((population.current + 1) <= population.cap && food.total >= calcWorkerCost(1)){
		document.getElementById("spawnMaxbutton").disabled = false;
	} else {
		document.getElementById("spawnMaxbutton").disabled = true;
	}

	var canRaise = (deity.type == "the Underworld" && devotion.total >= 20);
	setElemDisplay(document.getElementById("raiseDeadLine"), canRaise);
	if (canRaise && (corpses.total >= 1) && piety.total >= calcZombieCost(1)){
		document.getElementById("raiseDead").disabled = false;
		document.getElementById("raiseDeadMax").disabled = false;
	} else {
		document.getElementById("raiseDead").disabled = true;
		document.getElementById("raiseDeadMax").disabled = true;
	}
	if (canRaise && (corpses.total >= 100) && piety.total >= calcZombieCost(100)){
		document.getElementById("raiseDead100").disabled = false;
	} else {
		document.getElementById("raiseDead100").disabled = true;
	}
}


// Check to see if the player has an upgrade and hide as necessary
// Check also to see if the player can afford an upgrade and enable/disable as necessary
function updateUpgrades(){

// Internal convenience function
// upgradeId - The ID of the upgrade.
function updateUpgrade(upgradeId) {
	var havePrice = (canAfford(upgradeData[upgradeId].require) > 0);
	var havePrereqs = meetsPrereqs(upgradeData[upgradeId].prereqs);
	var haveUpgrade = upgrades[upgradeId];

	// Only show the purchase button if we have the prereqs, but haven't bought it yet.
	setElemDisplay(document.getElementById(upgradeId+"Line"),(havePrereqs && !haveUpgrade));
	// Show the already-purchased line if we've already bought it.
	setElemDisplay(document.getElementById("P"+upgradeId),haveUpgrade);
	// Only enable the button if we are able to buy, but haven't.
	document.getElementById(upgradeId).disabled = (!havePrereqs || !havePrice || haveUpgrade);
}
	var deitySpecEnable;

	updateUpgrade("skinning");
	updateUpgrade("harvesting");
	updateUpgrade("prospecting");
	updateUpgrade("domestication");
	updateUpgrade("ploughshares");
	updateUpgrade("irrigation");
	updateUpgrade("butchering");
	updateUpgrade("gardening");
	updateUpgrade("extraction");
	updateUpgrade("croprotation");
	updateUpgrade("selectivebreeding");
	updateUpgrade("fertilisers");
	updateUpgrade("flensing");
	updateUpgrade("macerating");

	//BUILDING TECHS
	updateUpgrade("masonry");
	updateUpgrade("construction");
	updateUpgrade("architecture");
	if (upgrades.architecture){ //unlock wonders
		setElemDisplay(document.getElementById("wonderLine"),true); //xxx PRESERVE
	} 
	updateUpgrade("wheel");
	updateUpgrade("horseback");
	updateUpgrade("tenements");
	updateUpgrade("slums");
	updateUpgrade("granaries");
	updateUpgrade("palisade");
	updateUpgrade("weaponry");
	updateUpgrade("shields");
	updateUpgrade("writing");
	updateUpgrade("administration");
	updateUpgrade("codeoflaws");
	updateUpgrade("mathematics");
	updateUpgrade("aesthetics");
	updateUpgrade("civilservice");
	updateUpgrade("feudalism");
	updateUpgrade("guilds");
	updateUpgrade("serfs");
	updateUpgrade("nationalism");

	//deity techs
	updateUpgrade("worship");
	document.getElementById("renameDeity").disabled = (!upgrades.worship);
	setElemDisplay(document.getElementById("deitySpecialisation"),((upgrades.worship) && (deity.type == "")));
	if (upgrades.worship){
		setElemDisplay(document.getElementById("battleUpgrades"),(deity.type == "Battle"));
		setElemDisplay(document.getElementById("fieldsUpgrades"),(deity.type == "the Fields"));
		setElemDisplay(document.getElementById("underworldUpgrades"),(deity.type == "the Underworld"));
		setElemDisplay(document.getElementById("zombieWorkers"), (population.zombies > 0));
		setElemDisplay(document.getElementById("catsUpgrades"),(deity.type == "Cats"));

		deitySpecEnable = upgrades.worship && (deity.type == "") && (piety.total >= 500);
		document.getElementById("deityBattle").disabled = !deitySpecEnable;
		document.getElementById("deityFields").disabled = !deitySpecEnable;
		document.getElementById("deityUnderworld").disabled = !deitySpecEnable;
		document.getElementById("deityCats").disabled = !deitySpecEnable;
	}
	//standard
	updateUpgrade("standard");
	setElemDisplay(document.getElementById("conquest"),upgrades.standard);
	if (upgrades.standard) { updateTargets(); }

	//cats
	updateUpgrade("lure");
	updateUpgrade("companion");
	updateUpgrade("comfort");
	//fields
	updateUpgrade("blessing");
	updateUpgrade("waste");
	updateUpgrade("stay");
	//battle
	updateUpgrade("riddle");
	updateUpgrade("throne");
	updateUpgrade("lament");
	//underworld
	updateUpgrade("book");
	updateUpgrade("feast");
	updateUpgrade("secrets");

	//trade
	updateUpgrade("trade");
	setElemDisplay(document.getElementById("tradeUpgradeContainer"),upgrades.trade); //xxx Eliminate this?
	updateUpgrade("currency");
	updateUpgrade("commerce");
}

function updateDeity(){
	if (!upgrades.worship) { return; }

	//Update page with deity details
	document.getElementById("deity" + deity.seniority + "Name").innerHTML = deity.name;
	document.getElementById("deity" + deity.seniority + "Type").innerHTML = (deity.type) ? ", deity of "+deity.type : "";
	document.getElementById("devotion" + deity.seniority).innerHTML = devotion.total;
	//Toggles deity types on for later playthroughs.
	if (deity.type == "Battle"){
		deity.battle = 1;
		if (!achievements.battle){
			gameLog("Achievement Unlocked: Battle");
			achievements.battle = 1;
			updateAchievements();
		}
	}
	if (deity.type == "the Fields"){
		deity.fields = 1;
		if (!achievements.fields){
			gameLog("Achievement Unlocked: Fields");
			achievements.fields = 1;
			updateAchievements();
		}
	}
	if (deity.type == "the Underworld"){
		deity.underworld = 1;
		if (!achievements.underworld){
			gameLog("Achievement Unlocked: Underworld");
			achievements.underworld = 1;
			updateAchievements();
		}
	}
	if (deity.type == "Cats"){
		deity.cats = 1;
		if (!achievements.cats){
			gameLog("Achievement Unlocked: Cats");
			achievements.cats = 1;
			updateAchievements();
		}
	}
	if (deity.battle && deity.fields && deity.underworld && deity.cats && !achievements.fullHouse){
		achievements.fullHouse = 1;
		gameLog("Achievement Unlocked: Full House");
		updateAchievements();
	}
}

function updateOldDeities(){
	var i,j;
	if (deityArray.length > 0){
		setElemDisplay(document.getElementById("oldDeities"),true);
		setElemDisplay(document.getElementById("iconoclasmGroup"),true);
	}
	if (oldDeities){
		document.getElementById("oldDeities").innerHTML = oldDeities;
	} else {
		var append = "<tr><td><b>Name</b></td><td><b>Domain</b></td><td><b>Devotion</b></td></tr>";
		for (i=(deityArray.length - 1);i>=0;i--){
			append += "<tr>";
				for (j=0;j<deityArray[i].length;j++){
					if (j > 0){
						append += "<td>";
						append += deityArray[i][j];
						append += "</td>";
					}
				}
			append += "</tr>";
		}
		document.getElementById("oldDeities").innerHTML = append;
	}
	
}

function updateMobs(){
	//Check through each mob type and update numbers or hide as necessary.
	setElemDisplay(document.getElementById("wolvesRow"), (population.wolves > 0));
	setElemDisplay(document.getElementById("banditsRow"), (population.bandits > 0));
	setElemDisplay(document.getElementById("barbariansRow"), (population.barbarians > 0));
	setElemDisplay(document.getElementById("esiegeRow"), (population.esiege > 0));
	setElemDisplay(document.getElementById("shadesRow"), (population.shades > 0));
}


// Enables or disables availability of activated religious powers.
// Passive religious benefits are handled by the upgrade system.
//xxx TODO: Make this more data-driven.
function updateDevotion(){
	document.getElementById("devotion" + deity.seniority).innerHTML = devotion.total;

	setElemDisplay(document.getElementById("smite"+"Line"),        (deity.type == "Battle" && devotion.total >= 20));
	document.getElementById("smite").disabled =                  (!(deity.type == "Battle" && devotion.total >= 20));
	//xxx Smite should be disabled if there are no foes.

	setElemDisplay(document.getElementById("glory"+"Line"),        (deity.type == "Battle" && devotion.total >= 40));
	document.getElementById("glory").disabled =                  (!(deity.type == "Battle" && devotion.total >= 40));

	setElemDisplay(document.getElementById("wickerman"+"Line"),    (deity.type == "the Fields" && devotion.total >= 20));
	document.getElementById("wickerman").disabled =              (!(deity.type == "the Fields" && devotion.total >= 20 && population.healthy > 0));

	setElemDisplay(document.getElementById("walk"+"Line"),         (deity.type == "the Fields" && devotion.total >= 40));
	document.getElementById("walk").disabled =                   (!(deity.type == "the Fields" && devotion.total >= 40 && population.healthy > 0));
	document.getElementById("ceaseWalk").disabled =                (walkTotal == 0);

	// raiseDead buttons updated by UpdateSpawnButtons

	setElemDisplay(document.getElementById("shade"+"Line"),        (deity.type == "the Underworld" && devotion.total >= 40));
	document.getElementById("shade").disabled =                  (!(deity.type == "the Underworld" && devotion.total >= 40));

	setElemDisplay(document.getElementById("pestControl"+"Line"),  (deity.type == "Cats" && devotion.total >= 20));
	document.getElementById("pestControl").disabled =            (!(deity.type == "Cats" && devotion.total >= 20));

	setElemDisplay(document.getElementById("grace"+"Line"),        (deity.type == "Cats" && devotion.total >= 40));
	document.getElementById("grace").disabled =                  (!(deity.type == "Cats" && devotion.total >= 40));
}

//xxx This should probably become a member method of the building classes
function updateRequirements(buildingObj){
	//When buildings are built, this increases their costs
	if (buildingObj == battleAltar){
		buildingObj.require.metal = 50 + (50 * buildingObj.total);
	}
	if (buildingObj == fieldsAltar){
		buildingObj.require.food = 500 + (250 * buildingObj.total);
		buildingObj.require.wood = 500 + (250 * buildingObj.total);
	}
	if (buildingObj == underworldAltar){
		buildingObj.require.corpses = 1 + buildingObj.total;
	}
	if (buildingObj == catAltar){
		buildingObj.require.herbs = 100 + (50 * buildingObj.total);
	}
	if (buildingObj == mill){
		buildingObj.require.stone = 100 * (buildingObj.total + 1) * Math.pow(1.05,buildingObj.total);
		buildingObj.require.wood = 100 * (buildingObj.total + 1) * Math.pow(1.05,buildingObj.total);
	}
	if (buildingObj == fortification){
		buildingObj.require.stone = 100 * (buildingObj.total + 1) * Math.pow(1.05,buildingObj.total);
	}
	var displayNode = document.getElementById(buildingObj.id + "Cost");
	if (displayNode && isValid(buildingObj.require)) { displayNode.innerHTML = getReqText(buildingObj.require); }
}

function updateAchievements(){
	//Displays achievements if they are unlocked
	//civ size
	if (achievements.hamlet) { setElemDisplay(document.getElementById("achHamlet"),true); }
	if (achievements.village) { setElemDisplay(document.getElementById("achVillage"),true); }
	if (achievements.smallTown) { setElemDisplay(document.getElementById("achSmallTown"),true); }
	if (achievements.largeTown) { setElemDisplay(document.getElementById("achLargeTown"),true); }
	if (achievements.smallCity) { setElemDisplay(document.getElementById("achSmallCity"),true); }
	if (achievements.largeCity) { setElemDisplay(document.getElementById("achLargeCity"),true); }
	if (achievements.metropolis) { setElemDisplay(document.getElementById("achMetropolis"),true); }
	if (achievements.smallNation) { setElemDisplay(document.getElementById("achSmallNation"),true); }
	if (achievements.nation) { setElemDisplay(document.getElementById("achNation"),true); }
	if (achievements.largeNation) { setElemDisplay(document.getElementById("achLargeNation"),true); }
	if (achievements.empire) { setElemDisplay(document.getElementById("achEmpire"),true); }
	//conquest
	if (achievements.raider) { setElemDisplay(document.getElementById("achRaider"),true); }
	if (achievements.engineer) { setElemDisplay(document.getElementById("achEngineer"),true); }
	if (achievements.domination) { setElemDisplay(document.getElementById("achDomination"),true); }
	//happiness
	if (achievements.hated) { setElemDisplay(document.getElementById("achHated"),true); }
	if (achievements.loved) { setElemDisplay(document.getElementById("achLoved"),true); }
	//other population
	if (achievements.plague) { setElemDisplay(document.getElementById("achPlague"),true); }
	if (achievements.ghostTown) { setElemDisplay(document.getElementById("achGhostTown"),true); }
	//cats
	if (achievements.cat) { setElemDisplay(document.getElementById("achCat"),true); }
	if (achievements.glaring) { setElemDisplay(document.getElementById("achGlaring"),true); }
	if (achievements.clowder) { setElemDisplay(document.getElementById("achClowder"),true); }
	//deities
	if (achievements.battle) { setElemDisplay(document.getElementById("achBattle"),true); }
	if (achievements.cats) { setElemDisplay(document.getElementById("achCats"),true); }
	if (achievements.fields) { setElemDisplay(document.getElementById("achFields"),true); }
	if (achievements.underworld) { setElemDisplay(document.getElementById("achUnderworld"),true); }
	if (achievements.fullHouse) { setElemDisplay(document.getElementById("achFullHouse"),true); }
	//wonders
	if (achievements.wonder) { setElemDisplay(document.getElementById("achWonder"),true); }
	if (achievements.seven) { setElemDisplay(document.getElementById("achSeven"),true); }
	//trading
	if (achievements.merchant) { setElemDisplay(document.getElementById("achMerchant"),true); }
	if (achievements.rushed) { setElemDisplay(document.getElementById("achRushed"),true); }
	//other
	if (achievements.neverclick) { setElemDisplay(document.getElementById("achNeverclick"),true); }
}

// Enable the raid buttons for eligible targets.
function updateTargets(){
	var i;
	var raidButtons = document.getElementsByClassName("raid");
	var haveArmy = ((population.soldiersParty + population.cavalryParty) > 0);
	var curElem;
	for(i=0;i<raidButtons.length;++i)
	{
		// Disable if we have no army, or they are too big a target.
		curElem = raidButtons[i];
		curElem.disabled = ((!haveArmy) || (civSizes[dataset(curElem,"civtype")] > civSizes[targetMax]));
	}
}

function updateHappiness(){
	//updates the happiness stat
	var text, color;
	//first check there"s someone to be happy or unhappy, not including zombies
	if (population.current < 1) { efficiency.happiness = 1; }

	if      (efficiency.happiness > 1.4) { text = "Blissful"; color = "#f0f"; }
	else if (efficiency.happiness > 1.2) { text = "Happy";    color = "#00f"; }
	else if (efficiency.happiness > 0.8) { text = "Content";  color = "#0b0"; } // Was "#0d0" if pop == 0
	else if (efficiency.happiness > 0.6) { text = "Unhappy";  color = "#880"; }
	else                                 { text = "Angry";    color = "#f00"; }

	document.getElementById("happiness").innerHTML = text;
	document.getElementById("happiness").style.color = color;
}

function updateWonder(){
	//updates the display of wonders and wonder building
	if (wonder.building){
		//show building area and labourers
		document.getElementById("labourersRow").style.display = "table-row";
		document.getElementById("wondersContainer").style.display = "block";
		if (wonder.completed){
			document.getElementById("inProgress").style.display = "none";
			document.getElementById("completed").style.display = "block";
			document.getElementById("speedWonderGroup").style.display = "none";
		} else {
			document.getElementById("inProgress").style.display = "block";
			document.getElementById("progressBar").style.width = wonder.progress.toFixed(2) + "%";
			document.getElementById("progressNumber").innerHTML = wonder.progress.toFixed(2);
			document.getElementById("completed").style.display = "none";
			document.getElementById("speedWonderGroup").style.display = "block";
		}
	} else {
		//hide building area and labourers
		document.getElementById("labourersRow").style.display = "none";
		document.getElementById("wondersContainer").style.display = "none";
	}
	updateWonderList();
}

function updateWonderList(){
	var i,j;
	if (wonder.total > 0){
		//update wonder list
		var wonderhtml = "<tr><td><strong>Name</strong></td><td><strong>Type</strong></td></tr>";
		for (i=(wonder.array.length - 1); i >= 0; i--){
			try {
				wonderhtml += "<tr>";
				for (j=0; j < wonder.array[i].length; j++){
					wonderhtml += "<td>";
					wonderhtml += wonder.array[i][j];
					wonderhtml += "</td>";
				}
				wonderhtml += "</tr>";
			} catch(err){
				console.log("Could not build wonder row " + i);
			}
		}
		document.getElementById("pastWonders").innerHTML = wonderhtml;
		//handle achievements
		if (!achievements.wonder){
			achievements.wonder = 1;
			gameLog("Achievement Unlocked: Wonder");
			updateAchievements();
		}
		if (!achievements.seven && wonder.food + wonder.wood + wonder.stone + wonder.skins + wonder.herbs + wonder.ore + wonder.leather + wonder.metal + wonder.piety >= 7){
			achievements.seven = 1;
			gameLog("Achievement Unlocked: Seven");
			updateAchievements();
		}
	}
}

function updateReset(){
	document.getElementById("resetNote"  ).style.display = (upgrades.worship || wonder.completed) ? "inline" : "none";
	document.getElementById("resetDeity" ).style.display = (upgrades.worship  ) ? "inline" : "none";
	document.getElementById("resetWonder").style.display = (wonder.completed) ? "inline" : "none";
	document.getElementById("resetBoth"  ).style.display = (upgrades.worship && wonder.completed) ? "inline" : "none";
}

function update(){

	//unified update function. NOT YET IMPLEMENTED

	//debugging - mark beginning of function execution
	var start = new Date().getTime();

	//call each existing update subfunction in turn
	updateResourceTotals(); //need to remove call to updatePopulation, move references to upgrades
	updateBuildingButtons();
	updatePopulation(); //move enabling/disabling by space to updateJobs, remove calls to updateJobs, updateMobs, updateHappiness, updateAchievements
	updateJobs();
	updateJobButtons();
	updateUpgrades();
	//updateDeity(); --- only needs to be called on initialisation and deity-related interactions ---
	//updateOldDeities(); --- only needs to be called on initialisation and deity-related interactions ---
	updateMobs();
	updateDevotion(); //need to add else clauses to disable buttons, change the way updates are revealed (unhidden as devotion increases)
	//updateRequirements(); --- only needs to be called on building-related interactions, though must subsequently call the update() function ---
	updateAchievements(); //should probably include else clauses
	updateParty(); //wrap in an "if(upgrades.standard){" clause in to short-circuit this when it's unnecessary
	updatePartyButtons();
	//updateTargets();  --- only to be called at initialisation and targetMax alterations
	updateHappiness();
	updateWonder(); //remove reference to updateWonderList
	//updateWonderList(); --- only to be called at initialisation and when wonders are created ---
	updateReset();
	
	//Debugging - mark end of function, calculate delta in milliseconds, and print to console
	var end = new Date().getTime();
	var time = end - start;
	//console.log("Update loop execution time: " + time + "ms"); //temporary altered to return time in order to run a debugging function
	return time;
}


// Game functions

function increment(material){
	var specialAmount, specialMaterial, activity;
	//This function is called every time a player clicks on a primary resource button
	resourceClicks += 1;
	document.getElementById("clicks").innerHTML = prettify(Math.round(resourceClicks));
	material.total = material.total + material.increment + (material.increment * 9 * (upgrades.civilservice?1:0)) + (material.increment * 40 * (upgrades.feudalism?1:0)) + ((upgrades.serfs?1:0) * Math.floor(Math.log(population.unemployed * 10 + 1))) + ((upgrades.nationalism?1:0) * Math.floor(Math.log((population.soldiers + population.cavalry) * 10 + 1)));
	//Handles random collection of special resources.
	if (Math.random() < material.specialchance){
		specialAmount = material.increment * (1 + (9 * (upgrades.guilds?1:0)));
		if (material == food)  { specialMaterial = skins; activity = "foraging"; }
		if (material == wood)  { specialMaterial = herbs; activity = "woodcutting"; }
		if (material == stone) { specialMaterial = ore; activity = "mining"; }
		specialMaterial.total += specialAmount;
		gameLog("Found " + specialMaterial.name + " while " + activity);
	}
	//Checks to see that resources are not exceeding their caps
	if (food.total > 200 + ((barn.total + (barn.total * (upgrades.granaries?1:0))) * 200)){
		food.total = 200 + ((barn.total + (barn.total * (upgrades.granaries?1:0))) * 200);
	}
	if (wood.total > 200 + (woodstock.total * 200)){
		wood.total = 200 + (woodstock.total * 200);
	}
	if (stone.total > 200 + (stonestock.total * 200)){
		stone.total = 200 + (stonestock.total * 200);
	}
	updateResourceTotals(); //Update the page with totals
}

function createBuilding(building,num){
	if (num == "custom") { num = getCustomBuildNumber(); }
	if (num == "-custom") { num = -getCustomBuildNumber(); }

	//First check the building requirements
	//Then deduct resources
	num = payFor(building.require,num);
	if (num > 0) {
		//Then increment the total number of that building
		building.total += num;
		//Increase devotion if the building was an altar.
		if (isValid(building.devotion)) { devotion.total += building.devotion * num; }
		//If building was graveyard, create graves
		if (building == graveyard) { digGraves(num); }
		//if building was temple and aesthetics has been activated, increase happiness
		if (building == temple && upgrades.aesthetics){
			var templeProp = num * 25 / population.current; //if population is large, temples have less effect
			mood(templeProp);
		}
		updateBuildingButtons(); //Update the buttons themselves
		updateDevotion(); //might be necessary if building was an altar
		updateRequirements(building); //Increases buildings' costs
		updateResourceTotals(); //Update page with lower resource values and higher building total
		//Then check for overcrowding
		if (totalBuildings > land){
			gameLog("You are suffering from overcrowding.");
			mood(num * -0.0025 * (upgrades.codeoflaws ? 0.5 : 1.0));
		}
		updateJobs(); //Update page with individual worker numbers, can't remember why this is called here
	} else {
		gameLog("Could not build, insufficient resources.");
	}
}

function getCustomNumber(elemId){
	var elem = document.getElementById(elemId);
	var num = Number(elem.value);

	// Check the above operations haven't returned NaN
	if (isNaN(num)){
		elem.style.background = "#f99"; //notify user that the input failed
		return 0;
	} 

	num = Math.floor(num); // Round down

	elem.value = num; //reset fractional numbers, check nothing odd happened
	elem.style.background = "#fff";

	return num;
}
function getCustomBuildNumber() { return getCustomNumber("buildCustom"); }
function getCustomSpawnNumber() { return getCustomNumber("spawnCustom"); }
function getCustomJobNumber()   { return getCustomNumber("jobCustom"  ); }
function getCustomArmyNumber()  { return getCustomNumber("armyCustom" ); }

//Calculates and returns the cost of adding a certain number of workers at the present population
function calcWorkerCost(num, curPop){
	if (curPop === undefined) { curPop = population.current; }
	return (20*num) + calcArithSum(0.01, curPop, curPop + num);
}
function calcZombieCost(num){ return calcWorkerCost(num, population.zombies)/5; }


// Create a cat
function spawnCat()
{
	gameLog("Found a cat!");
	++population.cats;
	if (population.cats >= 1 && !achievements.cat){
		gameLog("Achievement Unlocked: Cat!");
		achievements.cat = 1;
	}
	if (population.cats >= 10 && !achievements.glaring){
		gameLog("Achievement Unlocked: Glaring");
		achievements.glaring = 1;
	}
	if (population.cats >= 100 && !achievements.clowder){
		gameLog("Achievement Unlocked: Clowder");
		achievements.clowder = 1;
	}
	updateAchievements();
}

// Creates or destroys workers
function spawn(num){
	if (num == "custom") { num = getCustomSpawnNumber(); }
	if (num == "-custom") { num = -getCustomSpawnNumber(); }

	// Find the most workers we can spawn
	num = Math.max(num, -population.unemployed);  // Cap firing by # in that job.
	num = Math.min(num,logSearchFn(calcWorkerCost,food.total));

	// Apply population cap, and only allow whole workers.
	num = Math.min(num, (population.cap - population.current));

	// Update numbers and resource levels
	food.total -= calcWorkerCost(num);

	// New workers enter as farmers, but we only destroy unemployed ones.
	if (num >= 0) { population.farmers += num; }
	else          { population.unemployed += num; }

	population.current += num;

	//This is intentionally independent of the number of workers spawned
	if (Math.random() * 100 < 1 + (upgrades.lure?1:0)) { spawnCat(); }

	updateResourceTotals(); //update with new resource number
	updatePopulation(); //Run through the population->job update cycle
	
	return num;
}

// Picks the next worker to starve.  Kills the sick first, then the healthy.
// Deployed military starve last.
// Return a structure with two fields:
//   job: The job ID of the selected target.
//   base: The base occupation of the selected target.
function pickStarveTarget() {
	var modNum,jobNum;
	var modList=["Ill",""]; // The sick starve first
	var jobList=["unemployed","blacksmiths","tanners","miners","woodcutters",
		"clerics","cavalry","soldiers","healers","labourers","farmers"];

	for (modNum=0;modNum<modList.length;++modNum)
	{
		for (jobNum=0;jobNum<jobList.length;++jobNum)
		{
			if (population[jobList[jobNum]+modList[modNum]] > 0) 
				{ return {job:  jobList[jobNum]+modList[modNum], 
				          base: jobList[jobNum]}; }
		}
	}
	if (population.cavalryParty > 0) { return {job: "cavalryParty", base: "cavalry"}; }
	if (population.soldiersParty > 0) { return {job: "soldiersParty", base: "soldiers"}; }

	return {job: "", base:""};
}

// Culls workers when they starve.
function starve(num) {
	var target,i;
	if (num === undefined) { num = 1; }
	num = Math.min(num,population.current);

	for (i=0;i<num;++i)
	{
		target = pickStarveTarget();
		if (target.job == "") { return i; }

		--population[target.job];

		if (target.base == "soldiers" || target.base == "cavalry")
		{
			if (--population[target.job+"Cas"] < 0)
				{ population[target.job+"Cas"] = 0; }
		}

		++corpses.total; //Increments corpse number
		//Workers dying may trigger Book of the Dead
		if (upgrades.book) { piety.total += 10; }
	}

	return num;
}

// Hires or fires workers to/from a specific job.
// Pass a positive number to hire, a negative number to fire.
// If it can't add/remove as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass "custom" or "-custom" to use the custom increment.
// Returns the actual number hired or fired (negative if fired).
function hire(job,num){
	if (num ==  "custom") { num =  getCustomJobNumber(); }
	if (num == "-custom") { num = -getCustomJobNumber(); }

	num = canHire(job,num);  // How many can we actually get?

	// Pay for them if we're buying
	if (num > 0) { payFor(units[job].require,num); }

	// Do the actual hiring
	population[job] += num;
	population.unemployed -= num;

	if (isValid(population[job+"Cas"])) // If this unit can have casualties
	{
		population[job+"Cas"] += num;
		// It's possible that firing the last unit, if injured, could put its "Cas" negative
		if (population[job+"Cas"] < 0) { population[job+"Cas"] = 0; }
	}

	updatePopulation(); // Updates the page with the num in each job.

	return num;
}


// Creates or destroys zombies
// Pass a positive number to create, a negative number to destroy.
// Only unemployed zombies can be destroyed.
// If it can't create/destroy as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass "custom" or "-custom" to use the custom increment.
// Returns the actual number created or destroyed (negative if destroyed).
function raiseDead(num){
	if (num == "custom") { num = getCustomSpawnNumber(); }
	if (num == "-custom") { num = -getCustomSpawnNumber(); }

	// Find the most zombies we can raise
	num = Math.min(num, corpses.total);
	num = Math.max(num, -population.zombies);  // Cap firing by # in that job.
	num = Math.min(num,logSearchFn(calcZombieCost,piety.total));

	//Update numbers and resource levels
	piety.total -= calcZombieCost(num);
	population.zombies += num;
	population.unemployed += num;
	corpses.total -= num;

	//Notify player
	if      (num ==  1) { gameLog("A corpse rises, eager to do your bidding."); } 
	else if (num  >  1) { gameLog("The corpses rise, eager to do your bidding."); }
	else if (num == -1) { gameLog("A zombie crumples to the ground, inanimate."); }
	else if (num  < -1) { gameLog("The zombies fall, mere corpses once again."); }

	updatePopulation(); //Run through population->jobs cycle to update page with zombie and corpse totals
	updateResourceTotals(); //Update any piety spent

	return num;
}

function shade(){
	if (piety.total < 1000) { return 0; }
	if (population.enemiesSlain <= 0) { return 0; }

	piety.total -= 1000;
	var num = Math.ceil(population.enemiesSlain/4 + (Math.random() * population.enemiesSlain/4));
	population.enemiesSlain -= num;
	population.shades += num;

	return num;
}

//Called whenever player clicks a button to try to buy an upgrade.
function upgrade(name){
	//If the player has the resources, toggles the upgrade on and does stuff dependent on the upgrade.
	if (!meetsPrereqs(upgradeData[name].prereqs)) { return; } // Check prereqs
	if (payFor(upgradeData[name].require) < 1) { return; } // Try to pay
	upgrades[name] = true; // Mark upgrade
	if (isValid(upgradeData[name].onGain)) {upgradeData[name].onGain(); } // Take effect

	updateUpgrades(); //Update which upgrades are available to the player
	updateResourceTotals(); //Update reduced resource totals as appropriate.
}

//Deity specialisation upgrades
function selectDeity(name){

	if (piety.total < 500) { return; } // Can't pay
	piety.total -= 500;

	if (name == "battle")     { deity.type = "Battle"; }
	if (name == "fields")     { deity.type = "the Fields"; }
	if (name == "underworld") { deity.type = "the Underworld"; }
	if (name == "cats")       { deity.type = "Cats"; }

	deity[name] = 1;
	document.getElementById(name+"Upgrades").style.display = "inline";
	document.getElementById("deitySpecialisation").style.display = "none";
	updateDeity();
}

function digGraves(num){
	//Creates new unfilled graves.
	population.graves += 100 * num;
	updatePopulation(); //Update page with grave numbers
}

//Selects a random healthy worker based on their proportions in the current job distribution.
//xxx Doesn't currently pick from the army
function randomHealthyWorker(){
	var num = Math.random() * population.healthy;
	var jobs=[units.unemployed,units.farmers,units.woodcutters,units.miners,units.tanners,units.blacksmiths,
			  units.healers,units.clerics,units.labourers,units.cavalry,units.soldiers];
	var chance = 0;
	var i;
	for (i=0;i<jobs.length;++i)
	{
		chance += population[jobs[i].id];
		if (chance > num) { return jobs[i].id; }
	}

	return "";
}

function wickerman(){
	//Selects a random worker, kills them, and then adds a random resource
	if (wood.total < 500) { return; }

	//Select and kill random worker
	var job = randomHealthyWorker();
	if (job == "") { return; }

	--population[job];
	if (job == "soldiers" || job == "cavalry") {
		--population[job+"Cas"];
		//Killing the last soldier can send population.soldiersCas negative
		if (population[job+"Cas"] < 0) { population[job+"Cas"] = 0; }
	}

	//Remove wood
	wood.total -= 500;
	//Select a random resource (not ppiety)
	var num = Math.random();
	var msg;
	if (num < 1/8){
		food.total += Math.floor(Math.random() * 1000);
		msg = "The crops are abundant!";
	} else if (num < 2/8){
		wood.total += 500; // Guaranteed to at least restore initial cost.
		wood.total += Math.floor(Math.random() * 500);
		msg = "The trees grow stout!";
	} else if (num < 3/8){
		stone.total += Math.floor(Math.random() * 1000);
		msg = "The stone splits easily!";
	} else if (num < 4/8){
		skins.total += Math.floor(Math.random() * 1000);
		msg = "The animals are healthy!";
	} else if (num < 5/8){
		herbs.total += Math.floor(Math.random() * 1000);
		msg = "The gardens flourish!";
	} else if (num < 6/8){
		ore.total += Math.floor(Math.random() * 1000);
		msg = "A new vein is struck!";
	} else if (num < 7/8){
		leather.total += Math.floor(Math.random() * 1000);
		msg = "The tanneries are productive!";
	} else {
		metal.total += Math.floor(Math.random() * 1000);
		msg = "The steel runs pure.";
	}
	gameLog("Burned a " + getJobSingular(job) + ". " + msg);
	updateResourceTotals(); //Adds new resources
	updatePopulation(); //Removes killed worker
}

function walk(increment){
	if(increment){
		walkTotal += increment;
		document.getElementById("walkStat").innerHTML = prettify(walkTotal);
	} else {
		walkTotal = 0;
	}
	document.getElementById("ceaseWalk").disabled = (walkTotal == 0);
	setElemDisplay(document.getElementById("walkGroup"),(walkTotal > 0));
}

function doWalk() {
	var i;
	var target = "";
	if (walkTotal <= 0) { return; }

	for (i=0;i<walkTotal;i++){
		target = randomHealthyWorker();
		if (target == ""){
			walkTotal = 0;
			document.getElementById("ceaseWalk").disabled = true;
			break;
		} 
		--population.current;
		--population[target];

		if (target == "soldiers" || target == "cavalry"){
			--population[target+"Cas"];
			if (population[target+"Cas"] < 0){
				population[target] = 0;
				population[target+"Cas"] = 0;
			}
		}
	}
	updatePopulation();
}

function pestControl(length){
	//First check player has sufficient piety
	if (piety.total < 100) { return; }
	//Deduct piety
	piety.total -= 100;
	//Set food production bonus and set timer
	efficiency.pestBonus = 0.1;
	pestTimer = length * population.cats;
	//Inform player
	gameLog("The vermin are exterminated.");
}


/* Iconoclasm */

function iconoclasmList(){
	var i;
	//Lists the deities for removing
	if (piety.total >= 1000){
		piety.total -= 1000;
		updateResourceTotals();
		document.getElementById("iconoclasm").disabled = true;
		var append = "<br />";
		for (i=(deityArray.length - 1);i>=0;i--){
			if (deityArray[i][0]){
				append += '<button onclick="iconoclasm(' + i + ')">';
				append += deityArray[i][1];
				append += '</button><br />';
			}
		}
		append += '<br /><button onclick=\'iconoclasm("cancel")\'>Cancel</button>';
		document.getElementById("iconoclasmList").innerHTML = append;
	}
}

function iconoclasm(index){
	//will splice a deity from the deityArray unless the user has cancelled
	document.getElementById("iconoclasmList").innerHTML = "";
	document.getElementById("iconoclasm").disabled = false;
	if (index == "cancel"){
		//return the piety
		piety.total += 1000;
	} else {
		//give gold
		if (deityArray[index][3]) { gold.total += Math.floor(Math.pow(deityArray[index][3],1/1.25)); }
		//remove the deity
		deityArray.splice(index,1);
		if (deityArray.length == 0){
			document.getElementById("iconoclasmGroup").style.display = "none";
		}
		updateOldDeities();
	}
}

/* Enemies */

function summonMob(mobtype){
	//Calls spawnMob() if the player has the correct resources (was used by Deities of Battle)
	if (piety.total >= 100){
		piety.total -= 100;
		spawnMob(mobtype);
	}
}

function spawnMob(mobtype){
	var max_mob = 0, num_mob = 0, pct_sge = 0, num_sge = 0, msg="";
	//Creates enemies based on current population
	if (mobtype == "wolves"){
		max_mob = (population.current / 50);
		pct_sge = 0; // Wolves don't use siege engines.
	}
	if(mobtype == "bandits"){
		max_mob = ((population.current + population.zombies) / 50);
		pct_sge = Math.random();
	}
	if (mobtype == "barbarians"){
		max_mob = ((population.current + population.zombies) / 50);
		pct_sge = Math.random();
	}
	num_mob = Math.ceil(max_mob*Math.random());
	num_sge = Math.floor(pct_sge * num_mob/100);

	if (num_mob == 0) { return num_mob; }  // Nobody came

	population[mobtype] += num_mob;
	population[mobtype+"Cas"] += num_mob;
	population.esiege += num_sge;

	msg = prettify(num_mob) + " " + mobtype + " attacked";  //xxx L10N
	if (num_sge > 0) { 
		msg += ", with " + prettify(num_sge) + " siege engines";  //xxx L10N
		document.getElementById("esiegeRow").style.display = "table-row";
	} 
	gameLog(msg);
	document.getElementById(mobtype+"Row").style.display = "table-row";
	updateMobs(); //updates page with numbers

	return num_mob;
}

function smiteMob(mobtype) {
	if (!isValid(population[mobtype]) || population[mobtype] <= 0) { return 0; }
	var num = Math.min(population[mobtype],Math.floor(piety.total/100));
	piety.total -= num * 100;
	population[mobtype] -= num;
	population[mobtype+"Cas"] -= num;
	corpses.total += num; //xxx Should dead wolves count as corpses?
	population.enemiesSlain += num;
	if (upgrades.throne) { throneCount += num; }
	if (upgrades.book) { piety.total += num * 10; }
	gameLog("Struck down " + num + " " + mobtype); // L10N
	return num;
}

function smiteMobs(){
	smiteMob("barbarians");
	smiteMob("bandits");
	smiteMob("wolves");
	updateResourceTotals();
	updateMobs();
}

/* War Functions */

//Adds or removes units from army
function party(job,num){
	if (num == "custom") { num = getCustomArmyNumber(); }
	if (num == "-custom") { num = -getCustomArmyNumber(); }

	//xxx HACK: This should be done more elegantly
	// The autogeneration routines want to use the actual unit ID,
	// but this function wants the base unit type.
	if (job == "soldiersParty") { job = "soldiers"; }
	if (job == "cavalryParty") { job = "cavalry"; }

	if (job == "soldiers" || job == "cavalry"){
		// checks that there are sufficient units in pool
		num = Math.min(num, population[job]);
		// checks that there are sufficient units in army
		num = Math.max(num, -population[job+"Party"]);
		population[job+"Party"] += num;
		population[job+"Party"+"Cas"] += num;
		population[job] -= num;
		population[job+"Cas"] -= num;
	}
	if (job == "siege"){
		num = Math.min(num,Math.floor(wood.total/200),Math.floor(metal.total/50),Math.floor(leather.total/50));
		population.siege += num;
		wood.total -= 200 * num;
		metal.total -= 50 * num;
		leather.total -= 50 * num;
		if ((num > 0) && !achievements.engineer){
			achievements.engineer = 1;
			updateAchievements();
		}
	}
	updateResourceTotals(); //updates the food/second
	updatePopulation(); //updates the army display
	updatePartyButtons(); //updates the buttons
	updateTargets();
	updateJobs(); //updates the general pool
}

function invade(ecivtype){
	//invades a certain type of civilisation based on the button clicked
	var iterations = 0; //used to calculate random number of soldiers
	raiding.raiding = true;
	raiding.last = ecivtype;

	var epop = civSizes.getMaxPop(ecivtype) + 1;
	if (epop <= 0 ) // no max pop; use 2x min pop. xxx Assumes -1 sentinal value
	{
		epop = civSizes[civSizes[ecivtype]].min_pop * 2;
	}

	iterations = epop / 20;  // Minimum 5% military

	if (gloryTimer > 0) { iterations = (iterations * 2); } //doubles soldiers fought
	var esoldierRes = iterations + Math.floor(Math.random() * iterations * 4);
	var efortsRes = Math.floor(Math.random() * iterations / 250);
	population.esoldiers += esoldierRes;
	population.esoldiersCas += esoldierRes;
	population.eforts += efortsRes;
	if (gloryTimer > 0) { iterations = (iterations * 2); } //quadruples rewards (doubled here because doubled already above)
	raiding.iterations = iterations;
	updateTargets(); //updates largest raid target
	updatePopulation();
	document.getElementById("raidGroup").style.display = "none"; //Hides raid buttons until the raid is finished
}
function onInvade(event) { return invade(dataset(event.target,"civtype")); }

function plunder(){
	var plunderMsg = "";
	//capture land
	var plunderLand = Math.round((1 + (upgrades.administration?1:0)) * raiding.iterations * 10);
	//randomise loot
	var plunderLoot = {
		food    : Math.round(Math.random() * raiding.iterations * 10),
		wood    : Math.round(Math.random() * raiding.iterations * 10),
		stone   : Math.round(Math.random() * raiding.iterations * 10),
		skins   : Math.round(Math.random() * raiding.iterations * 10),
		herbs   : Math.round(Math.random() * raiding.iterations * 10),
		ore     : Math.round(Math.random() * raiding.iterations * 10),
		leather : Math.round(Math.random() * raiding.iterations * 10),
		metal   : Math.round(Math.random() * raiding.iterations * 10)
	};

	//add loot
	updateResourceTotals();
	payFor(plunderLoot,-1);  // We pay for -1 of these to receive them.
	land += plunderLand;

	// create message to notify player
	plunderMsg = civSizes[civSizes[raiding.last]].name + " defeated! ";
	plunderMsg += "Plundered " + getReqText(plunderLoot) + ". ";
	plunderMsg += "Captured " + prettify(plunderLand) + " land.";
	gameLog(plunderMsg); 

	raiding.raiding = false; //ends the raid state
	raiding.victory = false; //ends the victory state
	document.getElementById("victoryGroup").style.display = "none";
}

function glory(time){
	if (piety.total >= 1000){ //check it can be bought
		gloryTimer = time; //set timer
		piety.total -= 1000; //decrement resources
		document.getElementById("gloryTimer").innerHTML = gloryTimer; //update timer to player
		document.getElementById("gloryGroup").style.display = "block";
	}
}

function grace(delta){
	if (piety.total >= graceCost){
		piety.total -= graceCost;
		graceCost = Math.floor(graceCost * 1.2);
		document.getElementById("graceCost").innerHTML = prettify(graceCost);
		mood(delta);
		updateResourceTotals();
		updateHappiness();
	}
}

function mood(delta){
	//Changes and updates happiness given a delta value
	if (population.current + population.zombies > 0) { //dividing by zero is bad for hive
		//calculates zombie proportion (zombies do not become happy or sad)
		var fraction = population.current / (population.current + population.zombies);
		//alters happiness
		efficiency.happiness += delta * fraction;
		//check for achievements
		if (efficiency.happiness >= 1.5 && !achievements.loved){
			gameLog("Achievement Unlocked: Loved");
			achievements.loved = 1;
			updateAchievements();
		}
		if (efficiency.happiness <= 0.5 && !achievements.hated){
			gameLog("Achievement Unlocked: Hated");
			achievements.hated = 1;
			updateAchievements();
		}
		//Then check limits (50 is median, limits are max 0 or 100, but moderated by fraction of zombies)
		if (efficiency.happiness > 1 + (0.5 * fraction)){
			efficiency.happiness = 1 + (0.5 * fraction);
		} else if (efficiency.happiness < 1 - (0.5 * fraction)){
			efficiency.happiness = 1 - (0.5 * fraction);
		}
		updateHappiness(); //update to player
	}
}

/* Wonders functions */

function startWonder(){
	if (!wonder.completed && !wonder.building){
		renameWonder();
		document.getElementById("startWonder").disabled = true;
		document.getElementById("speedWonderGroup").style.display = "block";
		wonder.building = true;
		updateWonder();
	}
}

function renameWonder(){
	var n = prompt("Please name your Wonder:",wonder.name);
	wonder.name = n;
	document.getElementById("wonderNameP").innerHTML = wonder.name;
	document.getElementById("wonderNameC").innerHTML = wonder.name;
}

function wonderBonus(material){
	++wonder[material];
	gameLog("You now have a permanent bonus to " + material + " production.");
	wonder.array.push([wonder.name,material]);
	wonder.total = Math.max(wonder.food,wonder.wood,wonder.stone,wonder.skins,wonder.herbs,wonder.ore,wonder.leather,wonder.metal,wonder.piety);
	wonder.name = "";
	wonder.progress = 0;
	wonder.building = false;
	updateWonder();
}

function updateWonderLimited(){
	var lowItem = "";
	if      (food.total    < 1) { lowItem = food.name; }
	else if (wood.total    < 1) { lowItem = wood.name; }
	else if (stone.total   < 1) { lowItem = stone.name; }
	else if (skins.total   < 1) { lowItem = skins.name; }
	else if (herbs.total   < 1) { lowItem = herbs.name; }
	else if (ore.total     < 1) { lowItem = ore.name; }
	else if (leather.total < 1) { lowItem = leather.name; }
	else if (piety.total   < 1) { lowItem = piety.name; }
	else if (metal.total   < 1) { lowItem = metal.name; }

	if (lowItem != "")
		{ document.getElementById("limited").innerHTML = " by low " + lowItem; }
}

/* Trade functions */

function tradeTimer(){
	//first set timer length
	trader.timer = 10;
	//add the upgrades
	if (upgrades.currency) { trader.timer += 5; }
	if (upgrades.commerce) { trader.timer += 5; }
	if (upgrades.stay) { trader.timer += 5; }

	//then set material and requested amount
	var tradeItems =   // Item and base amount
		[{material : food, 		requested : 5000 },
		{ material : wood, 		requested : 5000 },
		{ material : stone, 	requested : 5000 },
		{ material : skins, 	requested :  500 },
		{ material : herbs, 	requested :  500 },
		{ material : ore, 		requested :  500 },
		{ material : leather, 	requested :  250 },
		{ material : metal, 	requested :  250 }];

	// Randomly select and merge one of the above.
	var selected = tradeItems[Math.floor(Math.random() * tradeItems.length)];
	trader.material = selected.material;
	trader.requested = selected.requested;
	trader.requested *= Math.ceil(Math.random() * 20); // Up to 20x amount

	document.getElementById("tradeContainer").style.display = "block";
	document.getElementById("tradeType").innerHTML = trader.material.name;
	document.getElementById("tradeRequested").innerHTML = prettify(trader.requested);
}

function trade(){
	//check we have enough of the right type of resources to trade
	if (!trader.material || (trader.material.total < trader.requested)) {
		gameLog("Not enough resources to trade.");
		return;
	}

	//subtract resources, add gold
	trader.material.total -= trader.requested;
	++gold.total;
	updateResourceTotals();
	gameLog("Traded " + trader.requested + " " + trader.material.name);
	if (!achievements.merchant){
		gameLog("Achievement Unlocked: Merchant");
		achievements.merchant = 1;
		updateAchievements();
	}
}

function buy(material){
	if (gold.total < 1) { return; }
	--gold.total;

	if (material == food    || material == wood  || material == stone) { material.total += 5000; }
	if (material == skins   || material == herbs || material == ore)   { material.total +=  500; }
	if (material == leather || material == metal)                      { material.total +=  250; }

	updateResourceTotals();
}

function speedWonder(){
	if (gold.total < 100) { return; }
	gold.total -= 100;

	wonder.progress += 1 / (Math.pow(1.5,wonder.total));
	updateWonder();
	if (!achievements.rushed){
		gameLog("Achievement Unlocked: Rushed");
		achievements.rushed = 1;
		updateAchievements();
	}
}

// Game infrastructure functions

// Load in saved data
function load(loadType){
	//define load variables
	var loadVar = {},
		loadVar2 = {};
		
	if (loadType === "cookie"){
		//check for cookies
		if (read_cookie(saveTag1) && read_cookie(saveTag2)){
			//set variables to load from
			loadVar = read_cookie(saveTag1);
			loadVar2 = read_cookie(saveTag2);
			//notify user
			gameLog("Loaded saved game from cookie");
			gameLog("Save system switching to localStorage.");
		} else {
			console.log("Unable to find cookie");
			return false;
		}
	}
	
	if (loadType === "localStorage"){
		//check for local storage
		var string1;
		var string2;
		var msg;
		try {
			string1 = localStorage.getItem(saveTag1);
			string2 = localStorage.getItem(saveTag2);
		} catch(err) {
			if (err instanceof SecurityError)
				{ msg = "Browser security settings blocked access to local storage."; }
			else 
				{ msg = "Cannot access localStorage - browser may not support localStorage, or storage may be corrupt"; }
			console.log(msg);
		}
		if (string1 && string2){
			loadVar = JSON.parse(string1);
			loadVar2 = JSON.parse(string2);
			//notify user
			gameLog("Loaded saved game from localStorage");
		} else {
			console.log("Unable to find variables in localStorage. Attempting to load cookie.");
			load("cookie");
			return false;
		}
	}
	
	if (loadType === "import"){
		//take the import string, decompress and parse it
		var compressed = document.getElementById("impexpField").value;
		var decompressed = LZString.decompressFromBase64(compressed);
		var revived = JSON.parse(decompressed);
		//set variables to load from
		loadVar = revived[0];
		loadVar2 = revived[1];
		//notify user
		gameLog("Imported saved game");
		//close import/export dialog
		//impexp();
	}

	var versionData = mergeObj(loadVar.versionData);
	console.log("Loading save game version " + versionData.major +
		"." + versionData.minor + "." + versionData.sub + "(" + versionData.mod + ").");
	
	// BACKWARD COMPATIBILITY SECTION //////////////////
	// v1.1.13: population.corpses moved to corpses.total
	if (!isValid(loadVar.corpses)) { loadVar.corpses = {}; }
	if (isValid(loadVar.population.corpses)) { 
		if (!isValid(loadVar.corpses.total)) { 
			loadVar.corpses.total = loadVar.population.corpses; 
		}
		delete loadVar.population.corpses; 
	}
	// v1.1.17: population.apothecaries moved to population.healers 
	if (isValid(loadVar.population.apothecaries)) { 
		if (!isValid(loadVar.population.healers)) { 
			loadVar.population.healers = loadVar.population.apothecaries; 
		}
		delete loadVar.population.apothecaries; 
	}

	// v1.1.28: autosave changed to a bool
	loadVar.autosave = (loadVar.autosave !== false && loadVar.autosave !== "off");

	// v1.1.29: 'deity' upgrade renamed to 'worship'
	if (isValid(loadVar.upgrades.deity)) { 
		if (!isValid(loadVar.upgrades.worship)) { 
			loadVar.upgrades.worship = loadVar.upgrades.deity; 
		}
		delete loadVar.upgrades.deity;
	}
	// v1.1.30: Upgrades converted from int to bool (should be transparent)
	// v1.1.31: deity.devotion moved to devotion.total.
	if (!isValid(loadVar.devotion)) { loadVar.devotion = {}; }
	if (isValid(loadVar.deity.devotion)) { 
		if (!isValid(loadVar.devotion.total)) { 
			loadVar.devotion.total = loadVar.deity.devotion; 
		}
		delete loadVar.deity.devotion; 
	}
	
	////////////////////////////////////////////////////
	//
	//xxx Why are we saving and restoring the names of basic resources?
	//    We should move the static values to prototype objects.
	//Note also that names are now used for the user-facing names.
	food = mergeObj(food, loadVar.food);
	wood = mergeObj(wood, loadVar.wood);
	stone = mergeObj(stone, loadVar.stone);
	skins = mergeObj(skins, loadVar.skins);
	herbs = mergeObj(herbs, loadVar.herbs);
	ore = mergeObj(ore, loadVar.ore);
	leather = mergeObj(leather, loadVar.leather);
	metal = mergeObj(metal, loadVar.metal);
	repairResources(); //xxx TEMPORARY fix for v1.1.29 resource corruption bug.
	piety = mergeObj(piety, loadVar.piety);
	gold = mergeObj(gold, loadVar.gold);
	corpses = mergeObj(corpses, loadVar.corpses);
	devotion = mergeObj(devotion, loadVar.devotion);
	if (isValid(loadVar.gold)){
		gold = mergeObj(gold, loadVar.gold);
	}
	corpses = mergeObj(corpses, loadVar.corpses);
	if (isValid(loadVar2.wonder)){
		wonder = mergeObj(wonder, loadVar2.wonder);
	}
	land = mergeObj(land, loadVar2.land);
	tent = mergeObj(tent, loadVar2.tent);
	whut = mergeObj(whut, loadVar2.whut);
	cottage = mergeObj(cottage, loadVar2.cottage);
	house = mergeObj(house, loadVar2.house);
	mansion = mergeObj(mansion, loadVar2.mansion);
	barn = mergeObj(barn, loadVar2.barn);
	woodstock = mergeObj(woodstock, loadVar2.woodstock);
	stonestock = mergeObj(stonestock, loadVar2.stonestock);
	tannery = mergeObj(tannery, loadVar2.tannery);
	smithy = mergeObj(smithy, loadVar2.smithy);
	apothecary = mergeObj(apothecary, loadVar2.apothecary);
	temple = mergeObj(temple, loadVar2.temple);
	barracks = mergeObj(barracks, loadVar2.barracks);
	stable = mergeObj(stable, loadVar2.stable);
	mill = mergeObj(mill, loadVar2.mill);
	updateRequirements(mill);
	graveyard = mergeObj(graveyard, loadVar2.graveyard);
	fortification = mergeObj(fortification, loadVar2.fortification);
	updateRequirements(fortification);
	battleAltar = mergeObj(battleAltar, loadVar2.battleAltar);
	updateRequirements(battleAltar);
	fieldsAltar = mergeObj(fieldsAltar, loadVar2.fieldsAltar);
	updateRequirements(fieldsAltar);
	underworldAltar = mergeObj(underworldAltar, loadVar2.underworldAltar);
	updateRequirements(underworldAltar);
	catAltar = mergeObj(catAltar, loadVar2.catAltar);
	updateRequirements(catAltar);
	if (isValid(loadVar2.resourceClicks)){
		resourceClicks = mergeObj(resourceClicks, loadVar2.resourceClicks);
	} else {
		resourceClicks = 999; //stops people getting the achievement with an old save version
	}
	worksafe = mergeObj(worksafe, loadVar2.worksafe);
	population = mergeObj(population, loadVar.population);
	efficiency = mergeObj(efficiency, loadVar.efficiency);
	upgrades = mergeObj(upgrades, loadVar.upgrades);
	if (isValid(loadVar.deity)) {
		deity = mergeObj(deity, loadVar.deity);
		if (deity.seniority > 1){
			document.getElementById("activeDeity").innerHTML = '<tr id="deity' + deity.seniority + '"><td><strong><span id="deity' + deity.seniority + 'Name">No deity</span></strong><span id="deity' + deity.seniority + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + deity.seniority + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + deity.seniority + ')">X</button></td></tr>';
		}
	}
	if (isValid(loadVar.achievements)){
		achievements = mergeObj(achievements, loadVar.achievements);
	}
	if (isValid(loadVar.raiding)){
		raiding = mergeObj(raiding, loadVar.raiding);
	}
	if (isValid(loadVar.targetMax)) { targetMax = mergeObj(targetMax, loadVar.targetMax); }
	if (isValid(loadVar.oldDeities)) { oldDeities = mergeObj(oldDeities, loadVar.oldDeities); }
	if (isValid(loadVar.deityArray)){ deityArray = mergeObj(deityArray, loadVar.deityArray); }
	if (isValid(loadVar.graceCost)){ graceCost = mergeObj(graceCost, loadVar.graceCost); }
	if (isValid(loadVar.walkTotal)){ walkTotal = mergeObj(walkTotal, loadVar.walkTotal); }
	if (isValid(loadVar.autosave)){ autosave = mergeObj(autosave, loadVar.autosave); }
	if (isValid(loadVar.size)) { size = mergeObj(size, loadVar.size); }
	civName = mergeObj(civName, loadVar.civName);
	rulerName = mergeObj(rulerName, loadVar.rulerName);
	updateResourceTotals();
	updateMobs();
	updateDeity();
	updateUpgrades();
	updateOldDeities();
	updateDevotion();
	updateParty();
	mood(0);
	updateHappiness();
	updateWonder();
	document.getElementById("clicks").innerHTML = prettify(Math.round(resourceClicks));
	document.getElementById("civName").innerHTML = civName;
	document.getElementById("rulerName").innerHTML = rulerName;
	document.getElementById("wonderNameP").innerHTML = wonder.name;
	document.getElementById("wonderNameC").innerHTML = wonder.name;
	document.getElementById("startWonder").disabled = (wonder.completed || wonder.building);
	document.getElementById("toggleAutosave").innerHTML = autosave ? "Disable Autosave" : "Enable Autosave";
		
	//Upgrade-related checks
	efficiency.farmers = 0.2 + (0.1 * (
	+ (upgrades.domestication?1:0) + (upgrades.ploughshares?1:0) + (upgrades.irrigation?1:0) 
	+ (upgrades.croprotation?1:0) + (upgrades.selectivebreeding?1:0) + (upgrades.fertilisers?1:0) + (upgrades.blessing?1:0)));

	var combatBonus = 0.01 * ((upgrades.riddle?1:0) + (upgrades.weaponry?1:0) + (upgrades.shields?1:0));
	efficiency.soldiers = 0.05 + combatBonus;
	efficiency.cavalry = 0.08 + combatBonus;
	efficiency.soldiersParty = 0.05 + combatBonus;
	efficiency.cavalryParty = 0.08 + combatBonus;
}

function save(savetype){
	var xmlhttp;
	//Create objects and populate them with the variables, these will be 
	//stored in HTML5 localStorage.  Split into two vars for historical
	//reasons (cookies didn't allow more than 4k).  Cookie support is now
	//deprecated.

	var saveVar = {
		food:food,
		wood:wood,
		stone:stone,
		skins:skins,
		herbs:herbs,
		ore:ore,
		leather:leather,
		metal:metal,
		piety:piety,
		gold:gold,
		corpses:corpses,
		devotion:devotion,
		population:population,
		efficiency:efficiency,
		upgrades:upgrades,
		deity:deity,
		raiding:raiding,
		achievements:achievements,
		deityArray:deityArray,
		civName:civName,
		rulerName:rulerName,
		autosave:autosave,
		graceCost:graceCost,
		walkTotal:walkTotal,
		targetMax:targetMax,
		size:size,
		versionData:versionData
	};
	var saveVar2 = {
		land:land,
		wonder:wonder,
		tent:tent,
		whut:whut,
		cottage:cottage,
		house:house,
		mansion:mansion,
		barn:barn,
		woodstock:woodstock,
		stonestock:stonestock,
		tannery:tannery,
		smithy:smithy,
		apothecary:apothecary,
		temple:temple,
		barracks:barracks,
		stable:stable,
		mill:mill,
		graveyard:graveyard,
		fortification:fortification,
		battleAltar:battleAltar,
		fieldsAltar:fieldsAltar,
		underworldAltar:underworldAltar,
		catAltar:catAltar,
		resourceClicks:resourceClicks,
		worksafe:worksafe
	};

	// BACKWARD COMPATIBILITY SECTION //////////////////
	// population.apothecaries moved to population.healers (v1.1.17)
	saveVar.population.apothecaries = saveVar.population.healers;

	// population.corpses moved to corpses.total (v1.1.13)
	saveVar.population.corpses = saveVar.corpses.total; // v1.1.13 change
	////////////////////////////////////////////////////

	// Delete the old cookie-based save to avoid mismatched saves
	document.cookie = [saveTag1, "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.", window.location.host.toString()].join("");
	document.cookie = [saveTag2, "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.", window.location.host.toString()].join("");

	//set localstorage
	try {
		localStorage.setItem(saveTag1, JSON.stringify(saveVar));
		localStorage.setItem(saveTag2, JSON.stringify(saveVar2));
	} catch(err) {
		console.log("Cannot access localStorage - browser may be old or storage may be corrupt");
	}
	//Update console for debugging, also the player depending on the type of save (manual/auto)
	console.log("Attempted save");
	if (savetype == "export"){
		var savestring = "[" + JSON.stringify(saveVar) + "," + JSON.stringify(saveVar2) + "]";
		var compressed = LZString.compressToBase64(savestring);
		console.log("Compressing Save");
		console.log("Compressed from " + savestring.length + " to " + compressed.length + " characters");
		document.getElementById("impexpField").value = compressed;
		gameLog("Saved game and exported to base64");
	}
	if (localStorage.getItem(saveTag1) && localStorage.getItem(saveTag2)) {
		console.log("Savegame exists");
		if (savetype == "auto"){
			console.log("Autosave");
			gameLog("Autosaved");
		} else if (savetype == "manual"){
			alert("Game Saved");
			console.log("Manual Save");
			gameLog("Saved game");
		}
	}
	try {
		xmlhttp = new XMLHttpRequest();
		xmlhttp.overrideMimeType("text/plain");
		xmlhttp.open("GET", "version.txt?r=" + Math.random(),true);
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4) {
				var sVersion = parseInt(xmlhttp.responseText,10);
				if (version < sVersion){
					versionAlert();
				}
			}
		};
		xmlhttp.send(null);
	} catch (err) {
		console.log("XMLHttpRequest failed");
	}
}

function toggleAutosave(){
	//Turns autosave on or off. Default on.
	autosave = !autosave;
	console.log("Autosave toggled to " + (autosave ? "on" : "off"));
	document.getElementById("toggleAutosave").innerHTML = autosave ? "Disable Autosave" : "Enable Autosave";
}

function deleteSave(){
	//Deletes the current savegame by setting the game's cookies to expire in the past.
	var really = confirm("Really delete save?"); //Check the player really wanted to do that.
	if (really){
		document.cookie = [saveTag1, "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.", window.location.host.toString()].join("");
		document.cookie = [saveTag2, "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.", window.location.host.toString()].join("");
		localStorage.removeItem(saveTag1);
		localStorage.removeItem(saveTag2);
		gameLog("Save Deleted");
	}
}

function renameCiv(newName){
	//Prompts player, uses result as new civName
	civName = (newName !== undefined) ? newName : prompt("Please name your civilisation",civName);
	if (!civName) { civName = "Woodstock"; }
	document.getElementById("civName").innerHTML = civName;
}
function renameRuler(newName){
	//Prompts player, uses result as rulerName
	rulerName = (newName !== undefined) ? newName : prompt("What is your name?",rulerName);
	if (!rulerName) { rulerName = "Orteil"; }
	document.getElementById("rulerName").innerHTML = rulerName;
}
function renameDeity(newName){
	//Prompts player, uses result as deity.name - called when first getting a deity
	deity.name = (newName !== undefined) ? newName : prompt("Who do your people worship?",deity.name);
	if (!deity.name) { deity.name = rulerName; } // Hey, despots tend to have big egos.
	updateDeity();
}

function reset(){
	//Resets the game, keeping some values but resetting most back to their initial values.
	var msg = "Really reset? You will keep past deities and wonders (and cats)"; //Check player really wanted to do that.
	if (!confirm(msg)) { return false; } // declined

	if (upgrades.deity){
		if (oldDeities){
			//Relegates current deity to the oldDeities table.
			if (deity.type){
				deity.type = ", deity of " + deity.type;
			}
			var append = oldDeities;
			//Sets oldDeities value
			oldDeities = '<tr id="deity' + deity.seniority + '"><td><strong><span id="deity' + deity.seniority + 'Name">' + deity.name + '</span></strong><span id="deity' + deity.seniority + 'Type" class="deityType">' + deity.type + '</span></td><td>Devotion: <span id="devotion' + deity.seniority + '">' + devotion.total + '</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + deity.seniority + ')">X</button></td></tr>' + append;
			//document.getElementById("activeDeity").innerHTML = '<tr id="deity' + (deity.seniority + 1) + '"><td><strong><span id="deity' + (deity.seniority + 1) + 'Name">No deity</span></strong><span id="deity' + (deity.seniority + 1) + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + (deity.seniority + 1) + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + (deity.seniority + 1) + ')">X</button></td></tr>';
		} else {
			deityArray.push([deity.seniority,deity.name,deity.type,devotion.total]);
		}
		document.getElementById("activeDeity").innerHTML = '<tr id="deity' + (deity.seniority + 1) + '"><td><strong><span id="deity' + (deity.seniority + 1) + 'Name">No deity</span></strong><span id="deity' + (deity.seniority + 1) + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + (deity.seniority + 1) + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + (deity.seniority + 1) + ')">X</button></td></tr>';
		deity.seniority += 1;
		document.getElementById("deitySpecialisation").style.display = "none";
	}
		
	food = mergeObj(food, {
		total:0,
		net:0,
		increment:1,
		specialchance:0.1
	});
	wood = mergeObj(wood, {
		total:0,
		net:0,
		increment:1,
		specialchance:0.1
	});
	stone = mergeObj(stone, {
		total:0,
		net:0,
		increment:1,
		specialchance:0.1
	});
	skins.total = 0;
	herbs.total = 0;
	ore.total = 0;
	leather.total = 0;
	metal.total = 0;
	piety.total = 0;
	gold.total = 0;
	corpses.total = 0;
	devotion.total = 0;

	land = 1000;
	tent.total = 0;
	whut.total = 0;
	cottage.total = 0;
	house.total = 0;
	mansion.total = 0;
	barn.total = 0;
	woodstock.total = 0;
	stonestock.total = 0;
	tannery.total = 0;
	smithy.total = 0;
	apothecary.total = 0;
	temple.total = 0;
	barracks.total = 0;
	stable.total = 0;
	graveyard.total = 0;
	mill.total = 0;
	updateRequirements(mill);
	fortification.total = 0;
	updateRequirements(fortification);
	battleAltar.total = 0;
	updateRequirements(battleAltar);
	fieldsAltar.total = 0;
	updateRequirements(fieldsAltar);
	underworldAltar.total = 0;
	updateRequirements(underworldAltar);
	catAltar.total = 0;
	updateRequirements(catAltar);

	wonder = {
		total:wonder.total,
		food:wonder.food,
		wood:wonder.wood,
		stone:wonder.stone,
		skins:wonder.skins,
		herbs:wonder.herbs,
		ore:wonder.ore,
		leather:wonder.leather,
		metal:wonder.metal,
		piety:wonder.piety,
		array:wonder.array,
		name:"",
		building:false,
		completed:false,
		progress:0
	};

	population = {
		current:0,
		cap:0,
		cats:population.cats, //Cats always carry over
		corpses:0,
		graves:0,
		zombies:0,
		unemployed:0,
		farmers:0,
		woodcutters:0,
		miners:0,
		tanners:0,
		blacksmiths:0,
		healers:0,
		clerics:0,
		labourers:0,
		soldiers:0,
		soldiersCas:0,
		cavalry:0,
		cavalryCas:0,
		soldiersParty:0,
		soldiersPartyCas:0,
		cavalryParty:0,
		cavalryPartyCas:0,
		siege:0,
		esoldiers:0,
		esoldiersCas:0,
		eforts:0,
		healthy:0,
		totalSick:0,
		unemployedIll:0,
		farmersIll:0,
		woodcuttersIll:0,
		minersIll:0,
		tannersIll:0,
		blacksmithsIll:0,
		healersIll:0,
		clericsIll:0,
		labourersIll:0,
		soldiersIll:0,
		soldiersCasIll:0,
		cavalryIll:0,
		cavalryCasIll:0,
		wolves:0,
		wolvesCas:0,
		bandits:0,
		banditsCas:0,
		barbarians:0,
		barbariansCas:0,
		esiege:0,
		enemiesSlain:0,
		shades:0
	};

	efficiency = {
		happiness:1,
		farmers:0.2 + (0.1 * (upgrades.blessing?1:0)),
		pestBonus:0,
		woodcutters:0.5,
		miners:0.2,
		tanners:0.5,
		blacksmiths:0.5,
		healers:0.1,
		clerics:0.05,
		soldiers:0.05,
		cavalry:0.08,
		soldiersParty:0.05,
		cavalryParty:0.08,
		wolves:0.05,
		bandits:0.07,
		barbarians:0.09,
		esoldiers:0.05,
		esiege:0.1, //each siege engine has 10% to hit
		eforts:0.01, // -1% damage
		fortification:0.01
	};

	upgrades = {
		domestication:false,
		ploughshares:false,
		irrigation:false,
		skinning:false,
		harvesting:false,
		prospecting:false,
		butchering:false,
		gardening:false,
		extraction:false,
		croprotation:false,
		selectivebreeding:false,
		fertilisers:false,
		masonry:false,
		construction:false,
		architecture:false,
		wheel:false,
		horseback:false,
		tenements:false,
		slums:false,
		granaries:false,
		palisade:false,
		weaponry:false,
		shields:false,
		writing:false,
		administration:false,
		codeoflaws:false,
		mathematics:false,
		aesthetics:false,
		civilservice:false,
		feudalism:false,
		guilds:false,
		serfs:false,
		nationalism:false,
		flensing:false,
		macerating:false,
		standard:false,
		trade:false,
		currency:false,
		commerce:false,
		worship:false,
		deityType:0,
		//Pantheon upgrades are permanent across resets
		lure:upgrades.lure,
		companion:upgrades.companion,
		comfort:upgrades.comfort,
		blessing:upgrades.blessing,
		waste:upgrades.waste,
		stay:upgrades.stay,
		riddle:upgrades.riddle,
		throne:upgrades.throne,
		lament:upgrades.lament,
		book:upgrades.book,
		feast:upgrades.feast,
		secrets:upgrades.secrets
	};
	deity = {
		name:"",
		type:"",
		//Seniority is either the same or was incremented earlier in the reset process
		seniority:deity.seniority,
		//Deities remain in your pantheon
		battle:deity.battle,
		fields:deity.fields,
		underworld:deity.underworld,
		cats:deity.cats
	};
	raiding = {
		raiding:false,
		victory:false
	};
	attackCounter = 0;
	resourceClicks = 0;
	graceCost = 1000;
	document.getElementById("graceCost").innerHTML = prettify(graceCost);
	walkTotal = 0;
	targetMax = "thorp";
	//Update page with all new values
	updateResourceTotals();
	updateUpgrades();
	updateDeity();
	updateOldDeities();
	updateDevotion();
	updateTargets();
	updateMobs();
	updateParty();
	updateWonder();
	//Reset upgrades and other interface elements that might have been unlocked
	document.getElementById("renameDeity").disabled = "true";
	document.getElementById("raiseDead").disabled = "true";
	document.getElementById("raiseDead100").disabled = "true";
	document.getElementById("raiseDeadMax").disabled = "true";
	document.getElementById("smite").disabled = "true";
	document.getElementById("wickerman").disabled = "true";
	document.getElementById("pestControl").disabled = "true";
	document.getElementById("grace").disabled = "true";
	document.getElementById("walk").disabled = "true";
	document.getElementById("ceaseWalk").disabled = "true";
	document.getElementById("lure").disabled = "true";
	document.getElementById("companion").disabled = "true";
	document.getElementById("comfort").disabled = "true";
	document.getElementById("book").disabled = "true";
	document.getElementById("feast").disabled = "true";
	document.getElementById("blessing").disabled = "true";
	document.getElementById("waste").disabled = "true";
	document.getElementById("riddle").disabled = "true";
	document.getElementById("throne").disabled = "true";
	document.getElementById("glory").disabled = "true";
	document.getElementById("shade").disabled = "true";

	setElemDisplay(document.getElementById("deitySelect"),(temple.total > 0));
	setElemDisplay(document.getElementById("conquestSelect"),(barracks.total > 0));
	setElemDisplay(document.getElementById("tradeSelect"),(gold.total > 0));

	document.getElementById("battleUpgrades").style.display = "none";
	document.getElementById("fieldsUpgrades").style.display = "none";
	document.getElementById("underworldUpgrades").style.display = "none";
	document.getElementById("catsUpgrades").style.display = "none";
	document.getElementById("constructionLine").style.display = "none";
	document.getElementById("architectureLine").style.display = "none";
	document.getElementById("tenementsLine").style.display = "none";
	document.getElementById("slumsLine").style.display = "none";
	document.getElementById("granariesLine").style.display = "none";
	document.getElementById("palisadeLine").style.display = "none";
	document.getElementById("civilserviceLine").style.display = "none";
	document.getElementById("cottageRow").style.display = "none";
	document.getElementById("houseRow").style.display = "none";
	document.getElementById("mansionRow").style.display = "none";
	document.getElementById("tanneryRow").style.display = "none";
	document.getElementById("smithyRow").style.display = "none";
	document.getElementById("apothecaryRow").style.display = "none";
	document.getElementById("templeRow").style.display = "none";
	document.getElementById("barracksRow").style.display = "none";
	document.getElementById("stableRow").style.display = "none";
	document.getElementById("millRow").style.display = "none";
	document.getElementById("fortificationRow").style.display = "none";
	document.getElementById("tannersRow").style.display = "none";
	document.getElementById("blacksmithsRow").style.display = "none";
	document.getElementById("healersRow").style.display = "none";
	document.getElementById("clericsRow").style.display = "none";
	document.getElementById("labourersRow").style.display = "none";
	document.getElementById("soldiersRow").style.display = "none";
	document.getElementById("cavalryRow").style.display = "none";
	document.getElementById("conquest").style.display = "none";

	document.getElementById("tradeContainer").style.display = "none";
	document.getElementById("tradeUpgradeContainer").style.display = "none";
	document.getElementById("startWonder").disabled = false;
	document.getElementById("wonderLine").style.display = "none";
	document.getElementById("iconoclasmList").innerHTML = "";
	document.getElementById("iconoclasm").disabled = false;
	gameLog("Game Reset"); //Inform player.

	renameCiv();
	renameRuler();
}

function doFarmers() {
	var millMod = 1;
	if (population.current > 0 || population.zombies > 0) { millMod = population.current / (population.current + population.zombies); }
	food.net = population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus) * (1 + (wonder.food/10)) * (1 + walkTotal/120) * (1 + mill.total * millMod / 200); //Farmers farm food
	food.net -= population.current; //The living population eats food.
	food.total += food.net;
	if (upgrades.skinning && population.farmers > 0){ //and sometimes get skins
		var num_skins = food.specialchance * (food.increment + ((upgrades.butchering?1:0) * population.farmers / 15.0)) * (1 + (wonder.skins/10));
		skins.total += rndRound(num_skins);
	}
}
function doWoodcutters() {
	wood.net = population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood/10)); //Woodcutters cut wood
	wood.total += wood.net;
	if (upgrades.harvesting && population.woodcutters > 0){ //and sometimes get herbs
		var num_herbs = wood.specialchance * (wood.increment + ((upgrades.gardening?1:0) * population.woodcutters / 5.0)) * (1 + (wonder.wood/10));
		herbs.total += rndRound(num_herbs);
	}
}

function doMiners() {
	stone.net = population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone/10)); //Miners mine stone
	stone.total += stone.net;
	if (upgrades.prospecting && population.miners > 0){ //and sometimes get ore
		var num_ore = stone.specialchance * (stone.increment + ((upgrades.extraction?1:0) * population.miners / 5.0)) * (1 + (wonder.ore/10));
		ore.total += rndRound(num_ore);
	}
}

function doBlacksmiths() {
	if (ore.total >= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness)){
		metal.total += population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness) * (1 + (wonder.metal/10));
		ore.total -= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness);
	} else if (population.blacksmiths) {
		metal.total += ore.total * (1 + (wonder.metal/10));
		ore.total = 0;
	}
}

function doTanners() {
	if (skins.total >= population.tanners * (efficiency.tanners * efficiency.happiness)){
		leather.total += population.tanners * (efficiency.tanners * efficiency.happiness) * (1 + (wonder.leather/10));
		skins.total -= population.tanners * (efficiency.tanners * efficiency.happiness);
	} else if (population.tanners) {
		leather.total += skins.total * (1 + (wonder.leather/10));
		skins.total = 0;
	}
}

function doClerics() {
	piety.total += population.clerics * (efficiency.clerics + (efficiency.clerics * (upgrades.writing?1:0))) * (1 + ((upgrades.secrets?1:0) * (1 - 100/(graveyard.total + 100)))) * efficiency.happiness * (1 + (wonder.piety/10));
}
// Try to heal the specified number of people in the specified job
// Makes them sick if the number is negative.
function heal(job,num)
{
	if (!isValid(job) || job == "") { return 0; }
	if (num === undefined) { num = 1; } // default to 1
	num = Math.min(num,population[job+"Ill"]);
	num = Math.max(num,-population[job]);
	population[job+"Ill"] -= num;
	population[job] += num;
	if (job == "soldiers" || job == "cavalry") { 
		population[job+"Cas"+"Ill"] -= num; 
		population[job+"Cas"] += num; 
	}

	return num;
}

function plague(sickNum){
	//Selects random workers, transfers them to their Ill variants
	var actualNum = 0;
	var i;

	updatePopulation();
	for (i=0;i<sickNum;i++){
		actualNum += -heal(randomHealthyWorker(),-1);

		//COPIED FROM updatePopulation();
		population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.healersIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
		population.healthy = population.unemployed + population.farmers + population.woodcutters + population.miners + population.tanners + population.blacksmiths + population.healers + population.clerics + population.labourers + population.soldiers + population.cavalry - population.zombies;
		population.current = population.healthy + population.totalSick + population.soldiersParty + population.cavalryParty;
		if (population.healthy < 1) { break; } //Makes sure there is someone healthy to get ill.
		if (population.current < 1) { break; } //Makes sure zombies aren't getting ill.
	}

	return actualNum;
}

// Select a sick worker type to cure, with certain priorities
function getNextPatient()
{ 
	var i;
	var jobs=["healers","farmers","soldiers","cavalry","clerics","labourers",
		"woodcutters","miners","tanners","blacksmiths","unemployed"];
	for (i=0;i<jobs.length;++i)
	{
		if (population[jobs[i]+"Ill"] > 0) { return jobs[i]; }
	}

	return "";
}

function doHealers() {
	var job, numHealed = 0;
	var numHealers = population.healers + (population.cats * (upgrades.companion?1:0));

	// How much healing can we do?
	cureCounter += (numHealers * efficiency.healers * efficiency.happiness);

	// We can't cure more sick people than there are
	cureCounter = Math.min(cureCounter, population.totalSick);

	// Cure people until we run out of healing capacity or herbs
	while (cureCounter >= 1 && herbs.total >= 1) {
		job = getNextPatient();
		if (job == "") { break; }
		heal(job); 
		--cureCounter;
		--herbs.total;
		++numHealed;
	}

	updatePopulation();
	return numHealed;
}

function doGraveyards()
{
	var i;
	if (corpses.total > 0 && population.graves > 0){
		//Clerics will bury corpses if there are graves to fill and corpses lying around
		for (i=0;i<population.clerics;i++){
			if (corpses.total > 0 && population.graves > 0){
				corpses.total -= 1;
				population.graves -= 1;
			}
		}
		updatePopulation();
	}
}

function doCorpses() {
	if (corpses.total <= 0) { return; }

	// Corpses lying around will occasionally make people sick.
	// 1-in-50 chance (1-in-100 with feast)
	var sickChance = Math.random() * (upgrades.feast ? 100 : 50);
	if (sickChance >= 1) { return; }

	// Infect up to 1% of the population.
	var num = Math.floor(population.current/100 * Math.random());
	if (num <= 0) {  return; }

	num = plague(num);
	if (num > 0) {
		updatePopulation();
		gameLog(prettify(num) + " workers got sick"); //notify player
	}
}

function doFight(attacker,defender)
{
	// Defenses vary depending on whether the player is attacking or defending.
	var fortMod = (defender.alignment == "player" ? (fortification.total * efficiency.fortification)
												  : (population.eforts * efficiency.eforts));
	var palisadeMod = ((defender.alignment == "player")&&(upgrades.palisade)) ?  efficiency.palisade : 0;

	//Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
	population[attacker.id+"Cas"] -= (getCasualtyMod(defender.id,attacker.id) * population[defender.id] * efficiency[defender.id]);
	population[defender.id+"Cas"] -= (getCasualtyMod(attacker.id,defender.id) * population[attacker.id] * (efficiency[attacker.id] - palisadeMod) * Math.max(1 - fortMod, 0));
	//If this reduces effective strengths below 0, reset it to 0.
	if (population[attacker.id+"Cas"] < 0){
		population[attacker.id+"Cas"] = 0;
	}
	if (population[defender.id+"Cas"] < 0){
		population[defender.id+"Cas"] = 0;
	}
	//Calculates the casualties dealt based on difference between actual numbers and new effective strength
	var attackerCas = population[attacker.id] - population[attacker.id+"Cas"];
	var attackerCasFloor = Math.floor(attackerCas);
	var defenderCas = population[defender.id] - population[defender.id+"Cas"];
	var defenderCasFloor= Math.floor(defenderCas);
	if (!(attackerCasFloor > 0)) { attackerCasFloor = 0; } //weirdness with floating point numbers. not sure why this is necessary
	if (!(defenderCasFloor > 0)) { defenderCasFloor = 0; }

	// Give player credit for kills.
	var playerCredit = ((attacker.alignment == "player") ? defenderCasFloor :
	                    (defender.alignment == "player") ? attackerCasFloor : 0);

	//Increments enemies slain, corpses, and piety
	population.enemiesSlain += playerCredit;
	if (upgrades.throne) { throneCount += playerCredit; }
	corpses.total += (attackerCasFloor + defenderCasFloor);
	if (upgrades.book) {
		piety.total += (attackerCasFloor + defenderCasFloor) * 10;
	}
	//Resets the actual numbers based on effective strength
	population[attacker.id] = Math.ceil(population[attacker.id+"Cas"]);
	population[defender.id] = Math.ceil(population[defender.id+"Cas"]);
}


function doSlaughter(attacker)
{
	var killVerb = (attacker.alignment == "animal") ? "eaten" : "killed";
	var target = randomHealthyWorker(); //Choose random worker
	if (target != "") { 
		if (Math.random() < attacker.killExhaustion) { // An attacker may disappear after killing
			population[attacker.id] -= 1;
			population[attacker.id+"Cas"] -= 1; }
		if (population[attacker.id+"Cas"] < 0) { population[attacker.id+"Cas"] = 0; }

		--population.current;
		--population[target];
		if (target == "soldiers" || target == "cavalry"){
			--population[target+"Cas"];
			if (population[target+"Cas"] < 0){
				population[target] = 0;
				population[target+"Cas"] = 0;
			}
		}
		if (attacker.alignment != "animal") { ++corpses.total; } // Animals will eat the corpse
		gameLog(getJobSingular(target) + " " + killVerb + " by " + attacker.name);
		updatePopulation();
	} else { // Attackers slowly leave once everyone is dead
		var leaving = Math.ceil(population[attacker.id] * Math.random() * attacker.killFatigue);
		population[attacker.id] -= leaving;
		population[attacker.id+"Cas"] -= leaving;
		updateMobs();
	}
}

function doLoot(attacker)
{
	var stealable=[food,wood,stone,skins,herbs,ore,leather,metal];

	// Select random resource, steal random amount of it.
	var target = stealable[Math.floor(Math.random() * stealable.length)];
	var stolenQty = Math.floor((Math.random() * 1000)); //Steal up to 1000.
	stolenQty = Math.min(stolenQty,target.total);
	if (stolenQty > 0) { gameLog(stolenQty + " " + target.name + " stolen by " + attacker.name); }
	target.total -= stolenQty;
	if (target.total <= 0) {
		//some will leave
		var leaving = Math.ceil(population[attacker.id] * Math.random() * attacker.lootFatigue);
		population[attacker.id] -= leaving;
		population[attacker.id+"Cas"] -= leaving;
		updateMobs();
	}
	population[attacker.id] -= 1; // Attackers leave after stealing something.
	population[attacker.id+"Cas"] -= 1;
	if (population[attacker.id+"Cas"] < 0) { population[attacker.id+"Cas"] = 0; }
	updateResourceTotals();
	updatePopulation();
}

function doSack(attacker)
{
	var burnable=[tent,whut,cottage,house,mansion,barn,woodstock,stonestock,
		          tannery,smithy,apothecary,temple,fortification,stable,mill];

	//Destroy buildings
	var target = burnable[Math.floor(Math.random() * burnable.length)];

	// Slightly different phrasing for fortifications
	var destroyVerb = "burned";
	if (target == fortification) { destroyVerb = "damaged"; } 

	if (target.total > 0){
		target.total -= 1;
		gameLog(target.name + " " + destroyVerb + " by " + attacker.name);
	} else {
		//some will leave
		var leaving = Math.ceil(population[attacker.id] * Math.random() * (1/112));
		population[attacker.id] -= leaving;
		population[attacker.id+"Cas"] -= leaving;
		updateMobs();
	}

	population[attacker.id] -= 1;
	population[attacker.id+"Cas"] -= 1;
	if (population[attacker.id] < 0) { population[attacker.id] = 0; }
	if (population[attacker.id+"Cas"] < 0) { population[attacker.id+"Cas"] = 0; }
	updateResourceTotals();
	updatePopulation();
}

function doHavoc()
{
	var havoc = Math.random(); //barbarians do different things
	if      (havoc < 0.3) { doSlaughter(units.barbarians); } 
	else if (havoc < 0.6) { doLoot(units.barbarians); } 
	else                  { doSack(units.barbarians); }
}

function doShades()
{
	if (population.shades <= 0) { return; }

	function shadeAttack(attacker,defender)
	{
		var num = Math.min((population[attacker.id]/4),population[defender.id]);
		//xxx Should we give book and throne credit here?
		population[defender.id] -= Math.floor(num);
		population[defender.id+"Cas"] -= num;
		population[attacker.id] -= Math.floor(num);
	}

	shadeAttack(units.wolves);
	shadeAttack(units.bandits);
	shadeAttack(units.barbarians);

	population.shades = Math.floor(population.shades * 0.95);
	if (population.shades < 0) { population.shades = 0; }
}

function doEsiege()
{
	if (population.esiege <= 0) { return; }

	var i, hit, firing;
	//First check there are enemies there defending them
	if (population.bandits > 0 || population.barbarians > 0){
		if (fortification.total > 0){ //needs to be something to fire at
			firing = Math.ceil(Math.min(population.esiege/2,100)); //At most half or 100 can fire at a time
			for (i = 0; i < firing; i++){
				if (fortification.total > 0){ //still needs to be something to fire at
					hit = Math.random();
					if (hit < efficiency.esiege){
						fortification.total -= 1;
						gameLog("Enemy siege engine damaged our fortifications");
						updateRequirements(fortification);
					} else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
						population.esiege -= 1;
					}
				}
			}
			updateResourceTotals();
		}
	} else if (population.soldiers > 0 || population.cavalry > 0) {
		//the siege engines are undefended
		if (upgrades.mathematics){ //Can we use them?
			gameLog("Captured " + prettify(population.esiege) + " enemy siege engines.");
			population.siege += population.esiege; //capture them
			updateParty(); //show them in conquest pane
		} else {
			//we can't use them, therefore simply destroy them
			gameLog("Destroyed " + prettify(population.esiege) + " enemy siege engines.");
		}
		population.esiege = 0;
	}
	updateMobs();
}

function doSiege()
{
	var i, hit;
	var firing = Math.ceil(Math.min(population.siege/2,population.eforts*2));
	if (firing > population.siege) { firing = population.siege; } //should never happen
	for (i = 0; i < firing; i++){
		if (population.eforts > 0){ //still needs to be something to fire at
			hit = Math.random();
			if (hit < efficiency.siege){ //each siege engine has 10% to hit
				population.eforts -= 1;
			} else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
				population.siege -= 1;
			}
		}
	}
}

function doSkirmish(attacker)
{
	if (population[attacker.id] <= 0) { return; }

	if (population.soldiers > 0 || population.cavalry > 0){ //FIGHT!
		//handles cavalry
		if (population.cavalry > 0){
			doFight(attacker,units.cavalry);
		}
		//handles soldiers
		if (population.soldiers > 0){
			doFight(attacker,units.soldiers);
		}
		//Updates population figures (including total population)
		updatePopulation();
	} else {
		attacker.onWin();
	}
}

//Handling mob attacks
function doMobs() {
	doSkirmish(units.wolves);
	doSkirmish(units.bandits);
	doSkirmish(units.barbarians);
	doShades();
	doEsiege();
}

function raidWin() {
	gameLog("Raid victorious!"); //notify player
	raiding.victory = true; //set victory for future handling
	//conquest achievements
	if (!achievements.raider){
		achievements.raider = 1;
		updateAchievements();
	}

	// If we beat the largest opponent, grant bonus achievement.
	if (raiding.last == civSizes[civSizes.length-1].id) 
	{
		if (!achievements.domination){
			achievements.domination = 1;
			updateAchievements();
		}
	}
	else if (raiding.last == targetMax)
	{
		// We fought our largest eligible foe.  Raise the limit.
		targetMax = civSizes[civSizes[targetMax] + 1].id;
	}
		// Improve mood based on size of defeated foe.
	mood((civSizes[raiding.last] + 1)/100);

	//lamentation
	if (upgrades.lament){
		attackCounter -= Math.ceil(raiding.iterations/100);
	}
}


function doRaid() {
	if (!raiding.raiding){ //handles the raiding subroutine
		// We're not raiding right now.
		document.getElementById("raidGroup").style.display = "block";
		return;
	}

	if (((population.soldiersParty + population.cavalryParty) > 0) || raiding.victory){ //technically you can win, then remove all your soldiers
		if (population.esoldiers > 0){
			/* FIGHT! */
			//Handles cavalry
			if (population.cavalryParty > 0){
				doFight(units.cavalryParty,units.esoldiers);
			}
			//Handles infantry
			if (population.soldiersParty > 0){
				doFight(units.soldiersParty,units.esoldiers);
			}
			//Handles siege engines
			if (population.siege > 0 && population.eforts > 0){ //need to be siege weapons and something to fire at
				doSiege();
			}
			/* END FIGHT! */
			
			//checks victory conditions (needed here because of the order of tests)
			if (population.esoldiers <= 0){
				population.esoldiers = 0; //ensure esoldiers is 0
				population.esoldiersCas = 0; //ensure esoldiers is 0
				population.eforts = 0; //ensure eforts is 0
				raidWin();
				updateTargets(); //update the new target
			}
			updateParty(); //display new totals for army soldiers and enemy soldiers
		} else if (raiding.victory){
			//handles the victory outcome
			document.getElementById("victoryGroup").style.display = "block";
		} else {
			//victory outcome has been handled, end raid
			raiding.raiding = false;
			raiding.iterations = 0;
		}
	} else {
		gameLog("Raid defeated");
		population.esoldiers = 0;
		population.esoldiersCas = 0;
		population.eforts = 0;
		population.siege = 0;
		updateParty();
		raiding.raiding = false;
		raiding.iterations = 0;
	}
}

function doLabourers() {
	if (!wonder.building) { return; }

	if (wonder.progress >= 100){
		//Wonder is finished! First, send workers home
		population.unemployed += population.labourers;
		population.unemployedIll += population.labourersIll;
		population.labourers = 0;
		population.labourersIll = 0;
		updatePopulation();
		//hide limited notice
		document.getElementById("lowResources").style.display = "none";
		//then set wonder.completed so things will be updated appropriately
		wonder.completed = true;
		//check to see if neverclick was achieved
		if (!achievements.neverclick && resourceClicks <= 22){
			achievements.neverclick = 1;
			gameLog("Achievement Unlocked: Neverclick!");
			updateAchievements();
		}
	} else {
		//we're still building
		
		// First, check our labourers and other resources to see if we're limited.
		var num = Math.min(population.labourers,food.total,wood.total,stone.total,skins.total,herbs.total,ore.total,leather.total,metal.total,piety.total);

		//remove resources
		food.total -= num;
		wood.total -= num;
		stone.total -= num;
		skins.total -= num;
		herbs.total -= num;
		ore.total -= num;
		leather.total -= num;
		metal.total -= num;
		piety.total -= num;

		//increase progress
		wonder.progress += num / (1000000 * Math.pow(1.5,wonder.total));
		
		//show/hide limited notice
		setElemDisplay(document.getElementById("lowResources"),(num < population.labourers));
		updateWonderLimited();
	}
	updateWonder();
}	

// Start of init program code
function initCivclicker() {
	addBuildingRows();
	addJobRows();
	addPartyRows();
	addUpgradeRows();
	addPUpgradeRows();

	//Prompt player for names
	if (!localStorage.getItem("civ") && !read_cookie("civ")) {
		renameCiv();
		renameRuler();
	}

	load("localStorage");//immediately attempts to load

	body.style.fontSize = size + "em";
	if (!worksafe){
		body.classList.add("hasBackground");
	} else {
		body.classList.remove("hasBackground");
		if (!usingWords){
			var elems = document.getElementsByClassName("icon");
			var i;
			for(i = 0; i < elems.length; i++) {
				elems[i].style.visibility = "hidden";
			}
		}
	}
}
initCivclicker();

/* Timed functions */
console.log("running");
window.setInterval(function(){
	//The whole game runs on a single setInterval clock. Basically this whole list is run every second
	//and should probably be minimised as much as possible.

	//debugging - mark beginning of loop execution
	//var start = new Date().getTime();
	
	//Autosave
	if (autosave) {
		autosaveCounter += 1;
		if (autosaveCounter >= 60){ //Currently autosave is every minute. Might change to 5 mins in future.
			save("auto");
			autosaveCounter = 1;
		}
	}
	
	//Resource-related
	doFarmers();
	doWoodcutters();
	doMiners();
	
	// Check for starvation
	var corpsesEaten;
	if (food.total < 0 && upgrades.waste) // Workers eat corpses if needed
	{
		corpsesEaten = Math.min(corpses.total,-food.total);
		corpses.total -= corpsesEaten;
		food.total += corpsesEaten;
	}

	var num_starve;
	if (food.total < 0) { // starve if there's not enough food.
		//xxx This is very kind.  Only 0.1% deaths no matter how big the shortage?
		num_starve = starve(Math.ceil(population.current/1000));
		if (num_starve == 1) { gameLog("A worker starved to death"); }
		if (num_starve > 1) { gameLog(prettify(num_starve) + " workers starved to death"); }
		updateJobs();
		mood(-0.01);
		food.total = 0;
		updatePopulation(); //Called because starve() doesn't. May just change starve()?
	}
	//Workers convert secondary resources into tertiary resources
	doBlacksmiths();
	doTanners();

	//Resources occasionally go above their caps.
	//Cull the excess /after/ the blacksmiths and tanners take their inputs.
	if (food.total > 200 + (barn.total * (upgrades.granaries?2:1) * 200)){
		food.total = 200 + (barn.total * (upgrades.granaries?2:1) * 200);
	}
	if (wood.total > 200 + (woodstock.total * 200)){
		wood.total = 200 + (woodstock.total * 200);
	}
	if (stone.total > 200 + (stonestock.total * 200)){
		stone.total = 200 + (stonestock.total * 200);
	}

	//Clerics generate piety
	doClerics();
	
	//Timers - routines that do not occur every second
	
	//Checks when mobs will attack
	//xxx Perhaps this should go after the doMobs() call, so we give 1 turn's warning?
	var check;
	if (population.current + population.zombies > 0) { attackCounter += 1; }
	if (population.current + population.zombies > 0 && attackCounter > (60 * 5)){ //Minimum 5 minutes
		check = Math.random() * 600;
		if (check < 1){
			attackCounter = 0;
			//Chooses which kind of mob will attack
			if (population.current + population.zombies >= 10000){
				var choose = Math.random();
				if (choose > 0.5){
					spawnMob("barbarians");
				} else if (choose > 0.2){
					spawnMob("bandits");
				} else {
					spawnMob("wolves");
				}
			} else if (population.current + population.zombies >= 1000){
				if (Math.random() > 0.5){
					spawnMob("bandits");
				} else {
					spawnMob("wolves");
				}
			} else {
				spawnMob("wolves");
			}
		}
	}
	//Decrements the pestTimer, and resets the bonus once it runs out
	if (pestTimer > 0){
		pestTimer -= 1;
	} else {
		efficiency.pestBonus = 0;
	}
	
	//Handles the Glory bonus
	if (gloryTimer > 0){
		document.getElementById("gloryTimer").innerHTML = gloryTimer;
		gloryTimer -= 1;
	} else {
		document.getElementById("gloryGroup").style.display = "none";
	}
	
	//traders occasionally show up
	if (population.current + population.zombies > 0) { tradeCounter += 1; }
	var delayMult = 60 * (3 - ((upgrades.currency?1:0)+(upgrades.commerce?1:0)));
	if (population.current + population.zombies > 0 && tradeCounter > delayMult){
		check = Math.random() * delayMult;
		if (check < (1 + (0.2 * (upgrades.comfort?1:0)))){
			tradeCounter = 0;
			tradeTimer();
		}
	}
	
	//Population-related
	doMobs();
	doRaid();

	doGraveyards();
	doHealers();
	doCorpses();

	if (population.totalSick > population.healthy && !achievements.plague){ //Plagued achievement requires sick people to outnumber healthy
		achievements.plague = 1;
		gameLog("Achievement Unlocked: Plagued");
		updateAchievements();
	}

	if (throneCount >= 100){
		//If sufficient enemies have been slain, build new temples for free
		temple.total += Math.floor(throneCount/100);
		throneCount = 0;
		updateResourceTotals();
	}
	
	if (graceCost > 1000) {
		graceCost -= 1;
		graceCost = Math.floor(graceCost);
		document.getElementById("graceCost").innerHTML = prettify(graceCost);
	}
	
	doWalk();
	
	doLabourers();

	//Trader stuff
	if (trader.timer > 0){
		if (trader.timer > 1){
			trader.timer -= 1;
		} else {
			document.getElementById("tradeContainer").style.display = "none";
			trader.timer -= 1;
		}
	}
	
	updateResourceTotals(); //This is the point where the page is updated with new resource totals
	
	updateUpgrades();
	updateBuildingButtons();
	updateJobs();
	updatePartyButtons();
	updateTargets();
	updateSpawnButtons();
	updateDevotion();
	updateReset();
	
	//Debugging - mark end of main loop and calculate delta in milliseconds
	//var end = new Date().getTime();
	//var time = end - start;
	//console.log("Main loop execution time: " + time + "ms");
	
}, 1000); //updates once per second (1000 milliseconds)

/* UI functions */

function paneSelect(name){
	// Called when user switches between the various panes on the left hand side of the interface
	// Turn them all off.
	document.getElementById("buildingsPane").style.display = "none";
	document.getElementById("upgradesPane").style.display = "none";
	document.getElementById("deityPane").style.display = "none";
	document.getElementById("conquestPane").style.display = "none";
	document.getElementById("tradePane").style.display = "none";
	//xxx DOM CSS should be able to add class here more cleanly.
	document.getElementById("buildingsSelect").className = "paneSelector";
	document.getElementById("upgradesSelect").className = "paneSelector";
	document.getElementById("deitySelect").className = "paneSelector";
	document.getElementById("conquestSelect").className = "paneSelector";
	document.getElementById("tradeSelect").className = "paneSelector";

	// Turn the desired ones back on.
	document.getElementById(name + "Pane").style.display = "block";
	document.getElementById(name + "Select").className = "paneSelector selected";
}

function toggleCustomIncrements(){
	var i;
	var elems;
	var curPop = population.current + population.zombies;

	customIncrements = !customIncrements;
	document.getElementById("toggleCustomIncrements").innerHTML = 
		customIncrements ? "Disable Custom Increments" : "Enable Custom Increments";
	setElemDisplay(document.getElementById("customJobIncrement"),customIncrements);
	setElemDisplay(document.getElementById("customArmyIncrement"),customIncrements);
	setElemDisplay(document.getElementById("customBuildIncrement"),customIncrements);
	setElemDisplay(document.getElementById("customSpawnIncrement"),customIncrements);
	setElemDisplay(document.getElementById("spawn1group"),!customIncrements);
	setElemDisplay(document.getElementById("spawn10"  ),!customIncrements && (curPop >=   10));
	setElemDisplay(document.getElementById("spawn100" ),!customIncrements && (curPop >=  100));
	setElemDisplay(document.getElementById("spawn1000"),!customIncrements && (curPop >= 1000));
	setElemDisplay(document.getElementById("spawnMax" ),!customIncrements && (curPop >= 1000));

	elems = document.getElementsByClassName("job10");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 10)); }

	elems = document.getElementsByClassName("job100");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 100)); }

	elems = document.getElementsByClassName("job1000");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 1000)); }

	elems = document.getElementsByClassName("building10");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 100)); }

	elems = document.getElementsByClassName("building100");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 1000)); }

	elems = document.getElementsByClassName("building1000");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!customIncrements && (curPop >= 10000)); }

	elems = document.getElementsByClassName("jobCustom");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],customIncrements); }

	elems = document.getElementsByClassName("buildingCustom");
	for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],customIncrements); }
}

// Toggles the display of the .notes class
//xxx It seems like it would be better to make a setting variable for this.
function toggleNotes(){
	var i;
	var elems = document.getElementsByClassName("note");
	for(i = 0; i < elems.length; i++) {
		if (elems[i].style.display == "none"){
			elems[i].style.display = "inline";
		} else {
			elems[i].style.display = "none";
		}
	}
	//then toggles the button itself
	if (document.getElementById("toggleNotes").innerHTML == "Disable Notes"){
		document.getElementById("toggleNotes").innerHTML = "Enable Notes";
	} else {
		document.getElementById("toggleNotes").innerHTML = "Disable Notes";
	}
}

function impExp(){
	if (document.getElementById("impexp").style.display == "block"){
		document.getElementById("impexp").style.display = "none";
		document.getElementById("impexpField").value = "";
	} else {
		document.getElementById("impexp").style.display = "block";
	}
}

function versionAlert(){
	console.log("New Version Available");
	document.getElementById("versionAlert").style.display = "inline";
}

function text(scale){
	if (scale > 0){
		size += 0.1 * scale;
		document.getElementById("smallerText").disabled = false;
	} else {
		if (size > 0.7){
			size += 0.1 * scale;
			if (size <= 0.7) { document.getElementById("smallerText").disabled = true; }
		}
	}
	body.style.fontSize = size + "em";
}

function textShadow(){
	if (body.style.textShadow != "none"){
		body.style.textShadow = "none";
		document.getElementById("textShadow").innerHTML = "Enable Text Shadow";
	} else {
		body.style.textShadow = "3px 0 0 #fff, -3px 0 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff";
		document.getElementById("textShadow").innerHTML = "Disable Text Shadow";
	}
}

function iconToggle(){
	//does nothing yet, will probably toggle display for "icon" and "word" classes as that's probably the simplest way to do this
	if (usingWords){
		usingWords = false;
		document.getElementById("iconToggle").innerHTML = "Use Words";
	} else {
		usingWords = true;
		document.getElementById("iconToggle").innerHTML = "Use Icons";
	}
}

var delimiters = true;
function prettify(input){
	if (!delimiters){
		return input.toString();
	} 
	return num2fmtString(input);
}

function toggleDelimiters(){
	delimiters = !delimiters;
	var action = delimiters ? "Disable" : "Enable";
	document.getElementById("toggleDelimiters").innerHTML = action + " Delimiters";

	updateResourceTotals();
}

function toggleWorksafe(){
	var i;
	var elems;

	worksafe = !worksafe;
	body.classList.toggle("hasBackground");
	if (!usingWords)
	{
		elems = document.getElementsByClassName("icon");
		for(i = 0; i < elems.length; i++) {
			elems[i].style.visibility = worksafe ? "hidden" : "visible";
		}
	}
}


/* Debug functions */

function gameLog(message){
	//Not strictly a debug function so much as it is letting the user know when something happens without needing to watch the console.
	var time = "0.00";
	//get the current date, extract the current time in HH.MM format
	var d = new Date();
	if (d.getMinutes() < 10){
		time = d.getHours() + ".0" + d.getMinutes();
	} else {
		time = d.getHours() + "." + d.getMinutes();
	}
	//Check to see if the last message was the same as this one, if so just increment the (xNumber) value
	if (document.getElementById("logL").innerHTML === message){
		logRepeat += 1;
		document.getElementById("log0").innerHTML = '<td id="logT">' + time + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
	} else {
		//Reset the (xNumber) value
		logRepeat = 1;
		//Go through all the logs in order, moving them down one and successively overwriting them.
		//Bottom five elements temporarily removed, may be readded later.
		/*document.getElementById("log9").innerHTML = document.getElementById("log8").innerHTML;
		document.getElementById("log8").innerHTML = document.getElementById("log7").innerHTML;
		document.getElementById("log7").innerHTML = document.getElementById("log6").innerHTML;
		document.getElementById("log6").innerHTML = document.getElementById("log5").innerHTML;
		document.getElementById("log5").innerHTML = document.getElementById("log4").innerHTML;*/
		document.getElementById("log4").innerHTML = document.getElementById("log3").innerHTML;
		document.getElementById("log3").innerHTML = document.getElementById("log2").innerHTML;
		document.getElementById("log2").innerHTML = document.getElementById("log1").innerHTML;
		//Since ids need to be unique, log1 strips the ids from the log0 elements when copying the contents.
		document.getElementById("log1").innerHTML = "<td>" + document.getElementById("logT").innerHTML + "</td><td>" + document.getElementById("logL").innerHTML + "</td><td>" + document.getElementById("logR").innerHTML + "</td>";
		//creates new contents with new time, message, and x1
		document.getElementById("log0").innerHTML = '<td id="logT">' + time + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
	}
}

function updateTest(){
	//Debug function, runs the update() function 1000 times, adds the results together, and calculates a mean
	var total = 0;
	var i;
	for (i=0;i<1000;i++){
		total += update();
	}
	console.log(total);
	total = total / 1000;
	console.log(total);
}

function ruinFun(){
	//Debug function adds loads of stuff for free to help with testing.
	food.total += 1000000;
	wood.total += 1000000;
	stone.total += 1000000;
	land += 15000;
	barn.total += 5000;
	woodstock.total += 5000;
	stonestock.total += 5000;
	herbs.total += 1000000;
	skins.total += 1000000;
	ore.total += 1000000;
	leather.total += 1000000;
	metal.total += 1000000;
	piety.total += 1000000;
	gold.total += 10000;
	renameRuler("Cheater");
	updatePopulation();
	updateUpgrades();
	updateResourceTotals();
}

//xxx This is a temporary function, designed to repair damage to a saved 
// game's resource definitions caused by a bug in v1.1.29alpha.
function repairResources() {
	food = mergeObj(food, { id:"food", name:"food" });
	wood = mergeObj(wood, { id:"wood", name:"wood" });
	stone = mergeObj(stone, { id:"stone", name:"stone" });
	skins = mergeObj(skins, { id:"skins", name:"skins" });
	herbs = mergeObj(herbs, { id:"herbs", name:"herbs" });
	ore = mergeObj(ore, { id:"ore", name:"ore" });
	leather = mergeObj(leather, { id:"leather", name:"leather" });
	metal = mergeObj(metal, { id:"metal", name:"metal" });
}

/*
 * If you're reading this, thanks for playing!
 * This project was my first major HTML5/Javascript game, and was as
 * much about learning Javascript as it is anything else. I hope it
 * inspires others to make better games. :)
 *
 *     David Holley
 */
