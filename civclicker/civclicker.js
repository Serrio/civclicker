"use strict";
/**
 * CivClicker
 * Copyright (C) 2014 David Holley <dhmholley@gmail.com>

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program (if you are reading this on the original
 * author's website, you can find a copy at
 * <http://dhmholley.co.uk/gpl.txt>). If not, see
 * <http://www.gnu.org/licenses/>.
 *
 * If you're reading this, thanks for playing!
 * This project was my first major HTML5/Javascript game, and was as
 * much about learning Javascript as it is anything else. I hope it
 * inspires others to make better games. :)
 */

var version = 19;
var logRepeat = 1;
console.log('running');

// Civ size category minimums
var civSizes = [];
civSizes.thorp       =  civSizes.length; 
civSizes[civSizes.thorp      ] = { min_pop :      0, name : "Thorp"       , id : "thorp"      };
civSizes.hamlet      =  civSizes.length; 
civSizes[civSizes.hamlet     ] = { min_pop :     20, name : "Hamlet"      , id : "hamlet"     };
civSizes.village     =  civSizes.length; 
civSizes[civSizes.village    ] = { min_pop :     60, name : "Village"     , id : "village"    };
civSizes.smallTown   =  civSizes.length; 
civSizes[civSizes.smallTown  ] = { min_pop :    200, name : "Small Town"  , id : "smallTown"  };
civSizes.largeTown   =  civSizes.length; 
civSizes[civSizes.largeTown  ] = { min_pop :   2000, name : "Large Town"  , id : "largeTown"  };
civSizes.smallCity   =  civSizes.length; 
civSizes[civSizes.smallCity  ] = { min_pop :   5000, name : "Small City"  , id : "smallCity"  };
civSizes.largeCity   =  civSizes.length; 
civSizes[civSizes.largeCity  ] = { min_pop :  10000, name : "Large City"  , id : "largeCity"  };
civSizes.metropolis  =  civSizes.length; 
civSizes[civSizes.metropolis ] = { min_pop :  20000, name : "Metropolis"  , id : "metropolis" };
civSizes.smallNation =  civSizes.length; 
civSizes[civSizes.smallNation] = { min_pop :  50000, name : "Small Nation", id : "smallNation"};
civSizes.nation      =  civSizes.length; 
civSizes[civSizes.nation     ] = { min_pop : 100000, name : "Nation"      , id : "nation"     };
civSizes.largeNation = civSizes.length; 
civSizes[civSizes.largeNation] = { min_pop : 200000, name : "Large Nation", id : "largeNation"};
civSizes.empire      = civSizes.length; 
civSizes[civSizes.empire     ] = { min_pop : 500000, name : "Empire"      , id : "empire"     };

civSizes.getCivSize = function(popcnt) {
    var i;
    for(i = this.length - 1; i >= 0; --i){
        if (popcnt >= this[i].min_pop) { return this[i]; }
    }
    return this[0];
};

// To find the max pop, we look at the next entry's min_pop and subtract one.
// If this is the last entry, return -1.
civSizes.getMaxPop = function(civType) {
	if ((civSizes[civType] + 1) < civSizes.length)
	{	
		return civSizes[civSizes[civType] + 1].min_pop - 1;
	}
	return -1;
};

// Initialise Data
var food = {
	name:'food',
	total:0,
	increment:1,
	specialchance:0.1
},
wood = {
	name:'wood',
	total:0,
	increment:1,
	specialchance:0.1
},
stone = {
	name:'stone',
	total:0,
	increment:1,
	specialchance:0.1
},
skins = {
	name:'skins',
	total:0
},
herbs = {
	name:'herbs',
	total:0
},
ore = {
	name:'ore',
	total:0
},
leather = {
	name:'leather',
	total:0
},
metal = {
	name:'metal',
	total:0
},
piety = {
	name:'piety',
	total:0
},
gold = {
	name:'gold',
	total:0
},
land = 1000,
totalBuildings = 0,
tent = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:2,
		stone:0,
		skins:2,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
whut = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:20,
		stone:0,
		skins:1,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
cottage = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:10,
		stone:30,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
house = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:30,
		stone:70,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
mansion = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:200,
		stone:200,
		skins:0,
		herbs:0,
		ore:0,
		leather:20,
		metal:0,
		piety:0,
		corpses:0
	}
},
barn = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:100,
		stone:0,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
woodstock = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:100,
		stone:0,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
stonestock = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:100,
		stone:0,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
tannery = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:30,
		stone:70,
		skins:2,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
smithy = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:30,
		stone:70,
		skins:0,
		herbs:0,
		ore:2,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
apothecary = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:30,
		stone:70,
		skins:0,
		herbs:2,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
temple = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:30,
		stone:120,
		skins:0,
		herbs:10,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
barracks = {
	total:0,
	devotion:0,
	require:{
		food:20,
		wood:60,
		stone:120,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:10,
		piety:0,
		corpses:0
	}
},
stable = {
	total:0,
	devotion:0,
	require:{
		food:60,
		wood:60,
		stone:120,
		skins:0,
		herbs:0,
		ore:0,
		leather:10,
		metal:0,
		piety:0,
		corpses:0
	}
},
mill = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:100,
		stone:100,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
graveyard = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:50,
		stone:200,
		skins:0,
		herbs:50,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
fortification = {
	total:0,
	devotion:0,
	require:{
		food:0,
		wood:0,
		stone:100,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:0,
		corpses:0
	}
},
battleAltar = {
	total:0,
	devotion:1,
	require:{
		food:0,
		wood:0,
		stone:200,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:50,
		piety:200,
		corpses:0
	}
},
fieldsAltar = {
	total:0,
	devotion:1,
	require:{
		food:500,
		wood:500,
		stone:200,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:200,
		corpses:0
	}
},
underworldAltar = {
	total:0,
	devotion:1,
	require:{
		food:0,
		wood:0,
		stone:200,
		skins:0,
		herbs:0,
		ore:0,
		leather:0,
		metal:0,
		piety:200,
		corpses:1
	}
},
catAltar = {
	total:0,
	devotion:1,
	require:{
		food:0,
		wood:0,
		stone:200,
		skins:0,
		herbs:100,
		ore:0,
		leather:0,
		metal:0,
		piety:200,
		corpses:0
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
	name:'',
	building:false,
	completed:false,
	progress:0
},
population = {
	current:0,
	cap:0,
	cats:0,
	corpses:0,
	zombies:0,
	graves:0,
	unemployed:0,
	farmers:0,
	woodcutters:0,
	miners:0,
	tanners:0,
	blacksmiths:0,
	apothecaries:0,
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
	apothecariesIll:0,
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
},
efficiency = {
	happiness:1,
	farmers:0.2,
	pestBonus:0,
	woodcutters:0.5,
	miners:0.2,
	tanners:0.5,
	blacksmiths:0.5,
	apothecaries:0.1,
	clerics:0.05,
	soldiers:0.05,
	cavalry:0.08
},
upgrades = {
	domestication:0,
	ploughshares:0,
	irrigation:0,
	skinning:0,
	harvesting:0,
	prospecting:0,
	butchering:0,
	gardening:0,
	extraction:0,
	croprotation:0,
	selectivebreeding:0,
	fertilisers:0,
	masonry:0,
	construction:0,
	architecture:0,
	wheel:0,
	horseback:0,
	tenements:0,
	slums:0,
	granaries:0,
	palisade:0,
	weaponry:0,
	shields:0,
	writing:0,
	administration:0,
	codeoflaws:0,
	mathematics:0,
	aesthetics:0,
	civilservice:0,
	feudalism:0,
	guilds:0,
	serfs:0,
	nationalism:0,
	flensing:0,
	macerating:0,
	standard:0,
	deity:0,
	deityType:0,
	lure:0,
	companion:0,
	comfort:0,
	blessing:0,
	waste:0,
	stay:0,
	riddle:0,
	throne:0,
	lament:0,
	book:0,
	feast:0,
	secrets:0,
	trade:0,
	currency:0,
	commerce:0
},
deity = {
	name:"",
	type:"",
	seniority:1,
	devotion:0,
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
	civType = 'Thorp',
	targetMax = 'thorp',
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
	autosave = "on",
	autosaveCounter = 1,
	customIncrements = false,
	usingWords = false,
	worksafe = false,
	size = 1,
	body = document.getElementsByTagName('body')[0];

//Prompt player for names
if (!read_cookie('civ') && !localStorage.getItem('civ')){
	var civName = prompt('Please name your civilisation','');
	document.getElementById('civName').innerHTML = civName;
}
if (!read_cookie('civ') && !localStorage.getItem('civ')){
	var rulerName = prompt('What is your name?','');
	document.getElementById('rulerName').innerHTML = rulerName;
}

// Load in saved data

function load(loadType){
	//define load variables
	var loadVar = {},
		loadVar2 = {};
		
	if (loadType === 'cookie'){
		//check for cookies
		if (read_cookie('civ') && read_cookie('civ2')){
			//set variables to load from
			loadVar = read_cookie('civ');
			loadVar2 = read_cookie('civ2');
			//notify user
			gameLog('Loaded saved game from cookie');
			gameLog('Save system switching to localStorage.');
		} else {
			console.log('Unable to find cookie');
			return false;
		}
	}
	
	if (loadType === 'localStorage'){
		//check for local storage
		var string1;
		var string2;
		try {
			string1 = localStorage.getItem('civ');
			string2 = localStorage.getItem('civ2');
		} catch(err) {
			console.log('Cannot access localStorage - browser may not support localStorage, or storage may be corrupt');
		}
		if (string1 && string2){
			loadVar = JSON.parse(string1);
			loadVar2 = JSON.parse(string2);
			//notify user
			gameLog('Loaded saved game from localStorage');
		} else {
			console.log('Unable to find variables in localStorage. Attempting to load cookie.');
			load('cookie');
			return false;
		}
	}
	
	if (loadType === 'import'){
		//take the import string, decompress and parse it
		var compressed = document.getElementById('impexpField').value;
		var decompressed = LZString.decompressFromBase64(compressed);
		var revived = JSON.parse(decompressed);
		//set variables to load from
		loadVar = revived[0];
		loadVar2 = revived[1];
		//notify user
		gameLog('Imported saved game');
		//close import/export dialog
		//impexp();
	}
	
	if (loadVar.food.name !== null) { food.name = loadVar.food.name; }
	if (loadVar.food.total !== null) { food.total = loadVar.food.total; }
	if (loadVar.food.increment !== null) { food.increment = loadVar.food.increment; }
	if (loadVar.food.specialchance !== null) { food.specialchance = loadVar.food.specialchance; }
	if (loadVar.wood.name !== null) { wood.name = loadVar.wood.name; }
	if (loadVar.wood.total !== null) { wood.total = loadVar.wood.total; }
	if (loadVar.wood.increment !== null) { wood.increment = loadVar.wood.increment; }
	if (loadVar.wood.specialchance !== null) { wood.specialchance = loadVar.wood.specialchance; }
	if (loadVar.stone.name !== null) { stone.name = loadVar.stone.name; }
	if (loadVar.stone.total !== null) { stone.total = loadVar.stone.total; }
	if (loadVar.stone.increment !== null) { stone.increment = loadVar.stone.increment; }
	if (loadVar.stone.specialchance !== null) { stone.specialchance = loadVar.stone.specialchance; }
	if (loadVar.skins.name !== null) { skins.name = loadVar.skins.name; }
	if (loadVar.skins.total !== null) { skins.total = loadVar.skins.total; }
	if (loadVar.herbs.name !== null) { herbs.name = loadVar.herbs.name; }
	if (loadVar.herbs.total !== null) { herbs.total = loadVar.herbs.total; }
	if (loadVar.ore.name !== null) { ore.name = loadVar.ore.name; }
	if (loadVar.ore.total !== null) { ore.total = loadVar.ore.total; }
	if (loadVar.leather.name !== null) { leather.name = loadVar.leather.name; }
	if (loadVar.leather.total !== null) { leather.total = loadVar.leather.total; }
	if (loadVar.metal.name !== null) { metal.name = loadVar.metal.name; }
	if (loadVar.metal.total !== null) { metal.total = loadVar.metal.total; }
	if (loadVar.piety.name !== null) { piety.name = loadVar.piety.name; }
	if (loadVar.piety.total !== null) { piety.total = loadVar.piety.total; }
	if (loadVar.gold !== null){
		if (loadVar.gold.name !== null) { gold.name = loadVar.gold.name; }
		if (loadVar.gold.total !== null) { gold.total = loadVar.gold.total; }
	}
	if (loadVar2.wonder !== null){
			if (loadVar2.wonder.total !== null) { wonder.total = loadVar2.wonder.total; }
			if (loadVar2.wonder.food !== null) { wonder.food = loadVar2.wonder.food; }
			if (loadVar2.wonder.wood !== null) { wonder.wood = loadVar2.wonder.wood; }
			if (loadVar2.wonder.stone !== null) { wonder.stone = loadVar2.wonder.stone; }
			if (loadVar2.wonder.skins !== null) { wonder.skins = loadVar2.wonder.skins; }
			if (loadVar2.wonder.herbs !== null) { wonder.herbs = loadVar2.wonder.herbs; }
			if (loadVar2.wonder.ore !== null) { wonder.ore = loadVar2.wonder.ore; }
			if (loadVar2.wonder.leather !== null) { wonder.leather = loadVar2.wonder.leather; }
			if (loadVar2.wonder.metal !== null) { wonder.metal = loadVar2.wonder.metal; }
			if (loadVar2.wonder.piety !== null) { wonder.piety = loadVar2.wonder.piety; }
			if (loadVar2.wonder.array !== null) { wonder.array = loadVar2.wonder.array; }
			if (loadVar2.wonder.name !== null) { wonder.name = loadVar2.wonder.name; }
			if (loadVar2.wonder.building !== null) { wonder.building = loadVar2.wonder.building; }
			if (loadVar2.wonder.completed !== null) { wonder.completed = loadVar2.wonder.completed; }
			if (loadVar2.wonder.progress !== null) { wonder.progress = loadVar2.wonder.progress; }
	}
	if (loadVar2.land !== null) { land = loadVar2.land; }
	if (loadVar2.tent.total !== null) { tent.total = loadVar2.tent.total; }
	if (loadVar2.whut.total !== null) { whut.total = loadVar2.whut.total; }
	if (loadVar2.cottage.total !== null) { cottage.total = loadVar2.cottage.total; }
	if (loadVar2.house.total !== null) { house.total = loadVar2.house.total; }
	if (loadVar2.mansion !== null){
		if (loadVar2.mansion.total !== null) { mansion.total = loadVar2.mansion.total; }
	}
	if (loadVar2.barn.total !== null) { barn.total = loadVar2.barn.total; }
	if (loadVar2.woodstock.total !== null) { woodstock.total = loadVar2.woodstock.total; }
	if (loadVar2.stonestock.total !== null) { stonestock.total = loadVar2.stonestock.total; }
	if (loadVar2.tannery.total !== null) { tannery.total = loadVar2.tannery.total; }
	if (loadVar2.smithy.total !== null) { smithy.total = loadVar2.smithy.total; }
	if (loadVar2.apothecary.total !== null) { apothecary.total = loadVar2.apothecary.total; }
	if (loadVar2.temple.total !== null) { temple.total = loadVar2.temple.total; }
	if (loadVar2.barracks.total !== null) { barracks.total = loadVar2.barracks.total; }
	if (loadVar2.stable !== null){
		if (loadVar2.stable.total !== null) { stable.total = loadVar2.stable.total; }
	}
	if (loadVar2.mill !== null){
		if (loadVar2.mill.total !== null) { mill.total = loadVar2.mill.total; }
		if (loadVar2.mill.require !== null){
			if (loadVar2.mill.require.wood !== null){
				mill.require.wood = loadVar2.mill.require.wood;
				document.getElementById('millCostW').innerHTML = mill.require.wood;
			}
			if (loadVar2.mill.require.stone !== null){
				mill.require.stone = loadVar2.mill.require.stone;
				document.getElementById('millCostS').innerHTML = mill.require.stone;
			}
		}
	}
	if (loadVar2.graveyard !== null){
		if (loadVar2.graveyard.total !== null) { graveyard.total = loadVar2.graveyard.total; }
	}
	if (loadVar2.fortification !== null){
		if (loadVar2.fortification.total !== null) { fortification.total = loadVar2.fortification.total; }
		if (loadVar2.fortification.require !== null){
			if (loadVar2.fortification.require.stone !== null){
				fortification.require.stone = loadVar2.fortification.require.stone;
				document.getElementById('fortCost').innerHTML = fortification.require.stone;
			}
		}
	}
	if (loadVar2.battleAltar !== null){
		if (loadVar2.battleAltar.total !== null) { battleAltar.total = loadVar2.battleAltar.total; }
		if (loadVar2.battleAltar.require !== null){
			if (loadVar2.battleAltar.require.metal !== null){
				battleAltar.require.metal = loadVar2.battleAltar.require.metal;
				document.getElementById('battleAltarCost').innerHTML = battleAltar.require.metal;
			}
		}
	}
	if (loadVar2.fieldsAltar !== null){
		if (loadVar2.fieldsAltar.total !== null) { fieldsAltar.total = loadVar2.fieldsAltar.total; }
		if (loadVar2.fieldsAltar.require !== null){
			if (loadVar2.fieldsAltar.require.food !== null){
				fieldsAltar.require.food = loadVar2.fieldsAltar.require.food;
				document.getElementById('fieldsAltarFoodCost').innerHTML = fieldsAltar.require.food; 
			}
			if (loadVar2.fieldsAltar.require.wood !== null){
				fieldsAltar.require.wood = loadVar2.fieldsAltar.require.wood;
				document.getElementById('fieldsAltarWoodCost').innerHTML = fieldsAltar.require.wood; 
			}
		}
	}
	if (loadVar2.underworldAltar !== null){
		if (loadVar2.underworldAltar.total !== null) { underworldAltar.total = loadVar2.underworldAltar.total; }
		if (loadVar2.underworldAltar.require !== null){
			if (loadVar2.underworldAltar.require.corpses !== null){
				underworldAltar.require.corpses = loadVar2.underworldAltar.require.corpses;
				document.getElementById('underworldAltarCost').innerHTML = underworldAltar.require.corpses;
			}
		}
	}
	if (loadVar2.catAltar !== null){
		if (loadVar2.catAltar.total !== null) { catAltar.total = loadVar2.catAltar.total; }
		if (loadVar2.catAltar.require !== null){
			if (loadVar2.catAltar.require.herbs !== null){
				catAltar.require.herbs = loadVar2.catAltar.require.herbs;
				document.getElementById('catAltarCost').innerHTML = catAltar.require.herbs;
			}
		}
	}
	if (loadVar2.resourceClicks !== null){
		resourceClicks = loadVar2.resourceClicks;
	} else if (loadVar2){
		resourceClicks = 999; //stops people getting the achievement with an old save version
	}
	if (loadVar2.worksafe !== null) { worksafe = loadVar2.worksafe; }
	if (loadVar.population.current !== null) { population.current = loadVar.population.current; }
	if (loadVar.population.cap !== null) { population.cap = loadVar.population.cap; }
	if (loadVar.population.cats !== null) { population.cats = loadVar.population.cats; }
	if (loadVar.population.corpses !== null) { population.corpses = loadVar.population.corpses; }
	if (loadVar.population.graves !== null) { population.graves = loadVar.population.graves; }
	if (loadVar.population.zombies !== null) { population.zombies = loadVar.population.zombies; }
	if (loadVar.population.unemployed !== null) { population.unemployed = loadVar.population.unemployed; }
	if (loadVar.population.farmers !== null) { population.farmers = loadVar.population.farmers; }
	if (loadVar.population.woodcutters !== null) { population.woodcutters = loadVar.population.woodcutters; }
	if (loadVar.population.miners !== null) { population.miners = loadVar.population.miners; }
	if (loadVar.population.tanners !== null) { population.tanners = loadVar.population.tanners; }
	if (loadVar.population.blacksmiths !== null) { population.blacksmiths = loadVar.population.blacksmiths; }
	if (loadVar.population.apothecaries !== null) { population.apothecaries = loadVar.population.apothecaries; }
	if (loadVar.population.clerics !== null) { population.clerics = loadVar.population.clerics; }
	if (loadVar.population.labourers !== null) { population.labourers = loadVar.population.labourers; }
	if (loadVar.population.soldiers !== null) { population.soldiers = loadVar.population.soldiers; }
	if (loadVar.population.soldiersParty !== null) { population.soldiersParty = loadVar.population.soldiersParty; }
	if (loadVar.population.soldiersPartyCas !== null) { population.soldiersPartyCas = loadVar.population.soldiersPartyCas; }
	if (loadVar.population.cavalry !== null) { population.cavalry = loadVar.population.cavalry; }
	if (loadVar.population.cavalryParty !== null) { population.cavalryParty = loadVar.population.cavalryParty; }
	if (loadVar.population.cavalryPartyCas !== null) { population.cavalryPartyCas = loadVar.population.cavalryPartyCas; }
	if (loadVar.population.siege !== null) { population.siege = loadVar.population.siege; }
	if (loadVar.population.esoldiers !== null) { population.esoldiers = loadVar.population.esoldiers; }
	if (loadVar.population.esoldiersCas !== null) { population.esoldiersCas = loadVar.population.esoldiersCas; }
	if (loadVar.population.eforts !== null) { population.eforts = loadVar.population.eforts; }
	if (loadVar.population.healthy !== null) { population.healthy = loadVar.population.healthy; }
	if (loadVar.population.totalSick !== null) { population.totalSick = loadVar.population.totalSick; }
	if (loadVar.population.unemployedIll !== null) { population.unemployedIll = loadVar.population.unemployedIll; }
	if (loadVar.population.farmersIll !== null) { population.farmersIll = loadVar.population.farmersIll; }
	if (loadVar.population.woodcuttersIll !== null) { population.woodcuttersIll = loadVar.population.woodcuttersIll; }
	if (loadVar.population.minersIll !== null) { population.minersIll = loadVar.population.minersIll; }
	if (loadVar.population.tannersIll !== null) { population.tannersIll = loadVar.population.tannersIll; }
	if (loadVar.population.blacksmithsIll !== null) { population.blacksmithsIll = loadVar.population.blacksmithsIll; }
	if (loadVar.population.apothecariesIll !== null) { population.apothecariesIll = loadVar.population.apothecariesIll; }
	if (loadVar.population.clericsIll !== null) { population.clericsIll = loadVar.population.clericsIll; }
	if (loadVar.population.labourersIll !== null) { population.labourersIll = loadVar.population.labourersIll; }
	if (loadVar.population.soldiersIll !== null) { population.soldiersIll = loadVar.population.soldiersIll; }
	if (loadVar.population.soldiersCasIll !== null) { population.soldiersCasIll = loadVar.population.soldiersCasIll; }
	if (loadVar.population.cavalryIll !== null) { population.cavalryIll = loadVar.population.cavalryIll; }
	if (loadVar.population.cavalryCasIll !== null) { population.cavalryCasIll = loadVar.population.cavalryCasIll; }
	if (loadVar.population.wolves !== null) { population.wolves = loadVar.population.wolves; }
	if (loadVar.population.bandits !== null) { population.bandits = loadVar.population.bandits; }
	if (loadVar.population.barbarians !== null) { population.barbarians = loadVar.population.barbarians; }
	if (loadVar.population.soldiersCas !== null) { population.soldiersCas = loadVar.population.soldiersCas; }
	if (loadVar.population.cavalryCas !== null) { population.cavalryCas = loadVar.population.cavalryCas; }
	if (loadVar.population.wolvesCas !== null) { population.wolvesCas = loadVar.population.wolvesCas; }
	if (loadVar.population.banditsCas !== null) { population.banditsCas = loadVar.population.banditsCas; }
	if (loadVar.population.barbariansCas !== null) { population.barbariansCas = loadVar.population.barbariansCas; }
	if (loadVar.population.esiege !== null) { population.esiege = loadVar.population.esiege; }
	if (loadVar.population.enemiesSlain !== null) { population.enemiesSlain = loadVar.population.enemiesSlain; }
	if (loadVar.population.shades !== null) { population.shades = loadVar.population.shades; }
	if (loadVar.efficiency.happiness !== null) { efficiency.happiness = loadVar.efficiency.happiness; }
	if (loadVar.efficiency.farmers !== null) { efficiency.farmers = loadVar.efficiency.farmers; }
	if (loadVar.efficiency.woodcutters !== null) { efficiency.woodcutters = loadVar.efficiency.woodcutters; }
	if (loadVar.efficiency.miners !== null) { efficiency.miners = loadVar.efficiency.miners; }
	if (loadVar.efficiency.tanners !== null) { efficiency.tanners = loadVar.efficiency.tanners; }
	if (loadVar.efficiency.blacksmiths !== null) { efficiency.blacksmiths = loadVar.efficiency.blacksmiths; }
	if (loadVar.efficiency.apothecaries !== null) { efficiency.apothecaries = loadVar.efficiency.apothecaries; }
	//if (loadVar.efficiency.clerics !== null) { efficiency.clerics = loadVar.efficiency.clerics; }
	if (loadVar.efficiency.soldiers !== null) { efficiency.soldiers = loadVar.efficiency.soldiers; }
	if (loadVar.efficiency.cavalry !== null) { efficiency.cavalry = loadVar.efficiency.cavalry; }
	if (loadVar.upgrades.domestication !== null) { upgrades.domestication = loadVar.upgrades.domestication; }
	if (loadVar.upgrades.ploughshares !== null) { upgrades.ploughshares = loadVar.upgrades.ploughshares; }
	if (loadVar.upgrades.irrigation !== null) { upgrades.irrigation = loadVar.upgrades.irrigation; }
	if (loadVar.upgrades.skinning !== null) { upgrades.skinning = loadVar.upgrades.skinning; }
	if (loadVar.upgrades.harvesting !== null) { upgrades.harvesting = loadVar.upgrades.harvesting; }
	if (loadVar.upgrades.prospecting !== null) { upgrades.prospecting = loadVar.upgrades.prospecting; }
	if (loadVar.upgrades.butchering !== null) { upgrades.butchering = loadVar.upgrades.butchering; }
	if (loadVar.upgrades.gardening !== null) { upgrades.gardening = loadVar.upgrades.gardening; }
	if (loadVar.upgrades.extraction !== null) { upgrades.extraction = loadVar.upgrades.extraction; }
	if (loadVar.upgrades.croprotation !== null) { upgrades.croprotation = loadVar.upgrades.croprotation; }
	if (loadVar.upgrades.selectivebreeding !== null) { upgrades.selectivebreeding = loadVar.upgrades.selectivebreeding; }
	if (loadVar.upgrades.fertilisers !== null) { upgrades.fertilisers = loadVar.upgrades.fertilisers; }
	if (loadVar.upgrades.masonry !== null) { upgrades.masonry = loadVar.upgrades.masonry; }
	if (loadVar.upgrades.construction !== null) { upgrades.construction = loadVar.upgrades.construction; }
	if (loadVar.upgrades.architecture !== null) { upgrades.architecture = loadVar.upgrades.architecture; }
	if (loadVar.upgrades.wheel !== null) { upgrades.wheel = loadVar.upgrades.wheel; }
	if (loadVar.upgrades.horseback !== null) { upgrades.horseback = loadVar.upgrades.horseback; }
	if (loadVar.upgrades.tenements !== null) { upgrades.tenements = loadVar.upgrades.tenements; }
	if (loadVar.upgrades.slums !== null) { upgrades.slums = loadVar.upgrades.slums; }
	if (loadVar.upgrades.granaries !== null) { upgrades.granaries = loadVar.upgrades.granaries; }
	if (loadVar.upgrades.palisade !== null) { upgrades.palisade = loadVar.upgrades.palisade; }
	if (loadVar.upgrades.weaponry !== null) { upgrades.weaponry = loadVar.upgrades.weaponry; }
	if (loadVar.upgrades.shields !== null) { upgrades.shields = loadVar.upgrades.shields; }
	if (loadVar.upgrades.writing !== null) { upgrades.writing = loadVar.upgrades.writing; }
	if (loadVar.upgrades.administration !== null) { upgrades.administration = loadVar.upgrades.administration; }
	if (loadVar.upgrades.codeoflaws !== null) { upgrades.codeoflaws = loadVar.upgrades.codeoflaws; }
	if (loadVar.upgrades.mathematics !== null) { upgrades.mathematics = loadVar.upgrades.mathematics; }
	if (loadVar.upgrades.aesthetics !== null) { upgrades.aesthetics = loadVar.upgrades.aesthetics; }
	if (loadVar.upgrades.civilservice !== null) { upgrades.civilservice = loadVar.upgrades.civilservice; }
	if (loadVar.upgrades.feudalism !== null) { upgrades.feudalism = loadVar.upgrades.feudalism; }
	if (loadVar.upgrades.guilds !== null) { upgrades.guilds = loadVar.upgrades.guilds; }
	if (loadVar.upgrades.serfs !== null) { upgrades.serfs = loadVar.upgrades.serfs; }
	if (loadVar.upgrades.nationalism !== null) { upgrades.nationalism = loadVar.upgrades.nationalism; }
	if (loadVar.upgrades.flensing !== null) { upgrades.flensing = loadVar.upgrades.flensing; }
	if (loadVar.upgrades.macerating !== null) { upgrades.macerating = loadVar.upgrades.macerating; }
	if (loadVar.upgrades.standard !== null) { upgrades.standard = loadVar.upgrades.standard; }
	if (loadVar.upgrades.deity !== null) { upgrades.deity = loadVar.upgrades.deity; }
	if (loadVar.upgrades.deityType !== null) { upgrades.deityType = loadVar.upgrades.deityType; }
	if (loadVar.upgrades.lure !== null) { upgrades.lure = loadVar.upgrades.lure; }
	if (loadVar.upgrades.companion !== null) { upgrades.companion = loadVar.upgrades.companion; }
	if (loadVar.upgrades.comfort !== null) { upgrades.comfort = loadVar.upgrades.comfort; }
	if (loadVar.upgrades.blessing !== null) { upgrades.blessing = loadVar.upgrades.blessing; }
	if (loadVar.upgrades.waste !== null) { upgrades.waste = loadVar.upgrades.waste; }
	if (loadVar.upgrades.stay !== null) { upgrades.stay = loadVar.upgrades.stay; }
	if (loadVar.upgrades.riddle !== null) { upgrades.riddle = loadVar.upgrades.riddle; }
	if (loadVar.upgrades.throne !== null) { upgrades.throne = loadVar.upgrades.throne; }
	if (loadVar.upgrades.lament !== null) { upgrades.lament = loadVar.upgrades.lament; }
	if (loadVar.upgrades.book !== null) { upgrades.book = loadVar.upgrades.book; }
	if (loadVar.upgrades.feast !== null) { upgrades.feast = loadVar.upgrades.feast; }
	if (loadVar.upgrades.secrets !== null) { upgrades.secrets = loadVar.upgrades.secrets; }
	if (loadVar.deity !== null) {
		if (loadVar.deity.name !== null) { deity.name = loadVar.deity.name; }
		if (loadVar.deity.type !== null) { deity.type = loadVar.deity.type; }
		if (loadVar.deity.seniority !== null) { deity.seniority = loadVar.deity.seniority; }
		if (deity.seniority > 1){
			document.getElementById('activeDeity').innerHTML = '<tr id="deity' + deity.seniority + '"><td><strong><span id="deity' + deity.seniority + 'Name">No deity</span></strong><span id="deity' + deity.seniority + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + deity.seniority + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + deity.seniority + ')">X</button></td></tr>';
		}
		if (loadVar.deity.devotion !== null) { deity.devotion = loadVar.deity.devotion; }
		if (loadVar.deity.battle !== null) { deity.battle = loadVar.deity.battle; }
		if (loadVar.deity.fields !== null) { deity.fields = loadVar.deity.fields; }
		if (loadVar.deity.underworld !== null) { deity.underworld = loadVar.deity.underworld; }
		if (loadVar.deity.cats !== null) { deity.cats = loadVar.deity.cats; }
	}
	if (loadVar.upgrades.trade !== null) { upgrades.trade = loadVar.upgrades.trade; }
	if (loadVar.upgrades.currency !== null) { upgrades.currency = loadVar.upgrades.currency; }
	if (loadVar.upgrades.commerce !== null) { upgrades.commerce = loadVar.upgrades.commerce; }
	if (loadVar.achievements !== null){
		if (loadVar.achievements.hamlet !== null) { achievements.hamlet = loadVar.achievements.hamlet; }
		if (loadVar.achievements.village !== null) { achievements.village = loadVar.achievements.village; }
		if (loadVar.achievements.smallTown !== null) { achievements.smallTown = loadVar.achievements.smallTown; }
		if (loadVar.achievements.largeTown !== null) { achievements.largeTown = loadVar.achievements.largeTown; }
		if (loadVar.achievements.smallCity !== null) { achievements.smallCity = loadVar.achievements.smallCity; }
		if (loadVar.achievements.largeCity !== null) { achievements.largeCity = loadVar.achievements.largeCity; }
		if (loadVar.achievements.metropolis !== null) { achievements.metropolis = loadVar.achievements.metropolis; }
		if (loadVar.achievements.smallNation !== null) { achievements.smallNation = loadVar.achievements.smallNation; }
		if (loadVar.achievements.nation !== null) { achievements.nation = loadVar.achievements.nation; }
		if (loadVar.achievements.largeNation !== null) { achievements.largeNation = loadVar.achievements.largeNation; }
		if (loadVar.achievements.empire !== null) { achievements.empire = loadVar.achievements.empire; }
		if (loadVar.achievements.raider !== null) { achievements.raider = loadVar.achievements.raider; }
		if (loadVar.achievements.engineer !== null) { achievements.engineer = loadVar.achievements.engineer; }
		if (loadVar.achievements.domination !== null) { achievements.domination = loadVar.achievements.domination; }
		if (loadVar.achievements.hated !== null) { achievements.hated = loadVar.achievements.hated; }
		if (loadVar.achievements.loved !== null) { achievements.loved = loadVar.achievements.loved; }
		if (loadVar.achievements.cat !== null) { achievements.cat = loadVar.achievements.cat; }
		if (loadVar.achievements.glaring !== null) { achievements.glaring = loadVar.achievements.glaring; }
		if (loadVar.achievements.clowder !== null) { achievements.clowder = loadVar.achievements.clowder; }
		if (loadVar.achievements.battle !== null) { achievements.battle = loadVar.achievements.battle; }
		if (loadVar.achievements.cats !== null) { achievements.cats = loadVar.achievements.cats; }
		if (loadVar.achievements.fields !== null) { achievements.fields = loadVar.achievements.fields; }
		if (loadVar.achievements.underworld !== null) { achievements.underworld = loadVar.achievements.underworld; }
		if (loadVar.achievements.fullHouse !== null) { achievements.fullHouse = loadVar.achievements.fullHouse; }
		if (loadVar.achievements.plague !== null) { achievements.plague = loadVar.achievements.plague; }
		if (loadVar.achievements.ghostTown !== null) { achievements.ghostTown = loadVar.achievements.ghostTown; }
		if (loadVar.achievements.wonder !== null) { achievements.wonder = loadVar.achievements.wonder; }
		if (loadVar.achievements.seven !== null) { achievements.seven = loadVar.achievements.seven; }
		if (loadVar.achievements.merchant !== null) { achievements.merchant = loadVar.achievements.merchant; }
		if (loadVar.achievements.rushed !== null) { achievements.rushed = loadVar.achievements.rushed; }
		if (loadVar.achievements.neverclick !== null) { achievements.neverclick = loadVar.achievements.neverclick; }
	}
	if (loadVar.raiding !== null){
		if (loadVar.raiding.raiding) { raiding.raiding = loadVar.raiding.raiding; }
		if (loadVar.raiding.iterations) { raiding.iterations = loadVar.raiding.iterations; }
		if (loadVar.raiding.last) { raiding.last = loadVar.raiding.last; }
	}
	if (loadVar.targetMax) { targetMax = loadVar.targetMax; }
	if (loadVar.oldDeities) { oldDeities = loadVar.oldDeities; }
	if (loadVar.deityArray) { deityArray = loadVar.deityArray; }
	if (loadVar.graceCost) { graceCost = loadVar.graceCost; }
	if (loadVar.walkTotal) { walkTotal = loadVar.walkTotal; }
	if (loadVar.autosave) { autosave = loadVar.autosave; }
	if (loadVar.size) { size = loadVar.size; }
	civName = loadVar.civName;
	rulerName = loadVar.rulerName;
	updateResourceTotals();
	updateBuildingTotals();
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
	document.getElementById('civName').innerHTML = civName;
	document.getElementById('rulerName').innerHTML = rulerName;
	document.getElementById('wonderNameP').innerHTML = wonder.name;
	document.getElementById('wonderNameC').innerHTML = wonder.name;
	if (!wonder.completed && !wonder.building){
		document.getElementById('startWonder').disabled = false;
	} else {
		document.getElementById('startWonder').disabled = true;
	}
		
	//Upgrade-related checks
	efficiency.farmers = 0.2 + (0.1 * upgrades.domestication) + (0.1 * upgrades.ploughshares) + (0.1 * upgrades.irrigation) + (0.1 * upgrades.croprotation) + (0.1 * upgrades.selectivebreeding) + (0.1 * upgrades.fertilisers) + (0.1 * upgrades.blessing);
	efficiency.soldiers = 0.05 + (0.01 * upgrades.riddle) + (0.01 * upgrades.weaponry) + (0.01 * upgrades.shields);
	efficiency.cavalry = 0.08 + (0.01 * upgrades.riddle) + (0.01 * upgrades.weaponry) + (0.01 * upgrades.shields);
}

load('localStorage');//immediately attempts to load

body.style.fontSize = size + "em";
if (!worksafe){
	body.style.backgroundImage = "url('images/constable.jpg')";
} else {
	body.style.backgroundImage = "none";
	if (!usingWords){
		var elems = document.getElementsByClassName('icon');
		var i;
		for(i = 0; i < elems.length; i++) {
			elems[i].style.visibility = 'hidden';
		}
	}
}

// Update functions. Called by other routines in order to update the interface.

function updateResourceTotals(){
	//Update page with resource numbers
	document.getElementById('food').innerHTML = prettify(Math.floor(food.total));
	document.getElementById('wood').innerHTML = prettify(Math.floor(wood.total));
	document.getElementById('stone').innerHTML = prettify(Math.floor(stone.total));
	document.getElementById('skins').innerHTML = prettify(Math.floor(skins.total));
	document.getElementById('herbs').innerHTML = prettify(Math.floor(herbs.total));
	document.getElementById('ore').innerHTML = prettify(Math.floor(ore.total));
	document.getElementById('leather').innerHTML = prettify(Math.floor(leather.total));
	document.getElementById('metal').innerHTML = prettify(Math.floor(metal.total));
	document.getElementById('piety').innerHTML = prettify(Math.floor(piety.total));
	document.getElementById('gold').innerHTML = prettify(Math.floor(gold.total));
	if (Math.round(gold.total) > 0){
		document.getElementById('goldRow').style.display = 'table-row';
		if (!upgrades.trade) { document.getElementById('tradeUpgrade').disabled = false; }
	}
	//Calculate and update net production values for primary resources
	var netFood = 0;
	if (population.current > 0 || population.zombies > 0){ //don't want to divide by zero
		netFood = (population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus)) * (1 + (wonder.food/10)) * (1 + walkTotal/120) * (1 + (mill.total/200) * (population.current/(population.current + population.zombies))) - population.current;
	} else {
		netFood = (population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus)) * (1 + (wonder.food/10)) * (1 + walkTotal/120) * (1 + (mill.total/200)) - population.current;
	}
	var netWood = population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood/10));
	var netStone = population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone/10));
	document.getElementById('netFood').innerHTML = prettify(netFood.toFixed(1));
	document.getElementById('netWood').innerHTML = prettify(netWood.toFixed(1));
	document.getElementById('netStone').innerHTML = prettify(netStone.toFixed(1));
	//Colourise net production values. Only food should be negative.
	if (netFood < 0){
		document.getElementById('netFood').style.color = '#f00';
	} else if (netFood == 0){
		document.getElementById('netFood').style.color = '#000';
	} else {
		document.getElementById('netFood').style.color = '#0b0';
	}
	if (netWood == 0){
		document.getElementById('netWood').style.color = '#000';
	} else {
		document.getElementById('netWood').style.color = '#0b0';
	}
	if (netStone == 0){
		document.getElementById('netStone').style.color = '#000';
	} else {
		document.getElementById('netStone').style.color = '#0b0';
	}
}

function updateBuildingTotals(){
	//Update page with building numbers, also stockpile limits.
	document.getElementById('tents').innerHTML = prettify(tent.total);
	document.getElementById('whuts').innerHTML = prettify(whut.total);
	document.getElementById('cottages').innerHTML = prettify(cottage.total);
	document.getElementById('houses').innerHTML = prettify(house.total);
	document.getElementById('mansions').innerHTML = prettify(mansion.total);
	document.getElementById('barns').innerHTML = prettify(barn.total);
	document.getElementById('maxfood').innerHTML = prettify(200 + (200 * (barn.total + (barn.total * upgrades.granaries))));
	document.getElementById('woodstock').innerHTML = prettify(woodstock.total);
	document.getElementById('maxwood').innerHTML = prettify(200 + (200 * woodstock.total));
	document.getElementById('stonestock').innerHTML = prettify(stonestock.total);
	document.getElementById('maxstone').innerHTML = prettify(200 + (200 * stonestock.total));
	document.getElementById('tanneries').innerHTML = prettify(tannery.total);
	document.getElementById('smithies').innerHTML = prettify(smithy.total);
	document.getElementById('apothecaria').innerHTML = prettify(apothecary.total);
	document.getElementById('temples').innerHTML = prettify(temple.total);
	document.getElementById('barracks').innerHTML = prettify(barracks.total);
	document.getElementById('stables').innerHTML = prettify(stable.total);
	document.getElementById('mills').innerHTML = prettify(mill.total);
	document.getElementById('graveyards').innerHTML = prettify(graveyard.total);
	document.getElementById('fortifications').innerHTML = prettify(fortification.total);
	//Update land values
	totalBuildings = tent.total + whut.total + cottage.total + house.total + mansion.total + barn.total + woodstock.total + stonestock.total + tannery.total + smithy.total + apothecary.total + temple.total + barracks.total + stable.total + mill.total + graveyard.total + fortification.total + battleAltar.total + fieldsAltar.total + underworldAltar.total + catAltar.total;
	var freeLand = Math.max(land - totalBuildings, 0);
	document.getElementById('totalLand').innerHTML = prettify(land);
	document.getElementById('totalBuildings').innerHTML = prettify(Math.round(totalBuildings));
	document.getElementById('freeLand').innerHTML = prettify(Math.round(freeLand));
	//Unlock jobs predicated on having certain buildings
	if (smithy.total > 0) { document.getElementById('blacksmithgroup').style.display = 'table-row'; }
	if (tannery.total > 0) { document.getElementById('tannergroup').style.display = 'table-row'; }
	if (apothecary.total > 0) { document.getElementById('apothecarygroup').style.display = 'table-row'; }
	if (temple.total > 0) { document.getElementById('clericgroup').style.display = 'table-row'; }
	if (barracks.total > 0) { document.getElementById('soldiergroup').style.display = 'table-row'; }
	if (stable.total > 0) { document.getElementById('cavalrygroup').style.display = 'table-row'; }
	//Unlock upgrades predicated on having certain buildings
	if (temple.total > 0 && upgrades.deity != 1){ //At least one Temple is required to unlock Worship
		document.getElementById('deity').disabled = false;
	}
	if (barracks.total > 0 && upgrades.standard != 1){ //At least one Barracks is required to unlock Standard
		document.getElementById('standard').disabled = false;
	}
	updatePopulation(); //updatePopulation() handles the population caps, which are determined by buildings.
}

function updatePopulation(){
	//Update population cap by multiplying out housing numbers
	population.cap = tent.total + (whut.total * 3) + (cottage.total * 6) + (house.total * (10 + (upgrades.tenements * 2) + (upgrades.slums * 2))) + (mansion.total * 50);
	//Update sick workers
	population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.apothecariesIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
	//Display or hide the sick row
	if (population.totalSick > 0){
		document.getElementById('sickGroup').style.display = 'table-row';
	}
	//Calculate healthy workers
	population.healthy = population.unemployed + population.farmers + population.woodcutters + population.miners + population.tanners + population.blacksmiths + population.apothecaries + population.clerics + population.soldiers + population.cavalry + population.labourers - population.zombies;
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
			console.log('Something has gone wrong. Population levels are: ' + population.unemployed + ', ' + population.farmers + ', ' + population.woodcutters + ', ' + population.miners + ', ' + population.blacksmiths + ', ' + population.apothecaries + ', ' + population.clerics + ', ' + population.soldiers + ', ' + population.soldiersParty + ', ' + population.cavalry + ', ' + population.cavalryParty + ', ' + population.labourers);
		}
	}
	//Update page with numbers
	document.getElementById('popcurrent').innerHTML = prettify(population.current);
	document.getElementById('popcap').innerHTML = prettify(population.cap);
	document.getElementById('zombies').innerHTML = prettify(population.zombies);
	document.getElementById('graves').innerHTML = prettify(population.graves);
	document.getElementById('sickTotal').innerHTML = prettify(population.totalSick);
	document.getElementById('gravesTotal').style.display = (population.graves > 0) ? "inline" : "none";

	//As population increases, various things change
	if (population.current == 0 && population.cap >= 1000){
		civType = 'Ghost Town';
		if (!achievements.ghostTown){
			gameLog('Achievement Unlocked: Ghost Town');
			achievements.ghostTown = 1;
		}
	}

    // Update our civ type name and score achievement if warranted.
    var civTypeInfo = civSizes.getCivSize(population.current);
	civType = civTypeInfo.name;
	if (achievements.hasOwnProperty(civTypeInfo.id) && !achievements[civTypeInfo.id]) {
		achievements[civTypeInfo.id] = 1;
		gameLog('Achievement Unlocked: ' + civTypeInfo.name);
	}

	if (population.zombies >= 1000 && population.zombies >= 2 * population.current){ //easter egg
		civType = 'Necropolis';
	}
	document.getElementById('civType').innerHTML = civType;

	//Unlocking interface elements as population increases to reduce unnecessary clicking
	var elems;
	var i;
	if (population.current + population.zombies >= 10) {
		if (!customIncrements){	
			document.getElementById('spawn10').style.display="inline";
			elems = document.getElementsByClassName('job10');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
	}
	if (population.current + population.zombies >= 100) {
		if (!customIncrements){
			document.getElementById('spawn100').style.display="block";
			elems = document.getElementsByClassName('buildingten');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
			elems = document.getElementsByClassName('job100');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
	}
	if (population.current + population.zombies >= 1000) {
		if (!customIncrements){
			document.getElementById('spawn1000').style.display="block";
			elems = document.getElementsByClassName('buildinghundred');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
		elems = document.getElementsByClassName('jobAll');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'table-cell';
		}
		elems = document.getElementsByClassName('jobNone');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'table-cell';
		}
	}
	if (population.current + population.zombies >= 10000) {
		if (!customIncrements){
			elems = document.getElementsByClassName('buildingthousand');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
	}
	updateSpawnButtons();
	//Calculates and displays the cost of buying workers at the current population.
	document.getElementById('workerCost').innerHTML = prettify(calcCost(1));
	document.getElementById('workerCost10').innerHTML = prettify(calcCost(10));
	document.getElementById('workerCost100').innerHTML = prettify(calcCost(100));
	document.getElementById('workerCost1000').innerHTML = prettify(calcCost(1000));
	updateJobs(); //handles the display of individual worker types
	updateMobs(); //handles the display of enemies
	updateHappiness();
	updateAchievements(); //handles display of achievements
}
function updateSpawnButtons(){
	//Turning on/off buttons based on free space.
	if ((population.current + 1) <= population.cap && food.total >= calcCost(1)){
		document.getElementById('spawn1').disabled = false;
	} else {
		document.getElementById('spawn1').disabled = true;
	}
	if ((population.current + 10) <= population.cap && food.total >= calcCost(10)){
		document.getElementById('spawn10button').disabled = false;
	} else {
		document.getElementById('spawn10button').disabled = true;
	}
	if ((population.current + 100) <= population.cap && food.total >= calcCost(100)){
		document.getElementById('spawn100button').disabled = false;
	} else {
		document.getElementById('spawn100button').disabled = true;
	}
	if ((population.current + 1000) <= population.cap && food.total >= calcCost(1000)){
		document.getElementById('spawn1000button').disabled = false;
	} else {
		document.getElementById('spawn1000button').disabled = true;
	}
	if (population.current == population.cap){
		document.getElementById('spawn1').disabled = true;
		document.getElementById('spawn10button').disabled = true;
		document.getElementById('spawn100button').disabled = true;
		document.getElementById('spawn1000button').disabled = true;
	}
}

function updateJobs(){
	//Update the page with the latest worker distribution and stats
	document.getElementById('unemployed').innerHTML = prettify(population.unemployed);
	document.getElementById('farmers').innerHTML = prettify(population.farmers);
	updateJobButtons('farmers','farmer',false,false);
	document.getElementById('woodcutters').innerHTML = prettify(population.woodcutters);
	updateJobButtons('woodcutters','woodcutter',false,false);
	document.getElementById('miners').innerHTML = prettify(population.miners);
	updateJobButtons('miners','miner',false,false);
	document.getElementById('tanners').innerHTML = prettify(population.tanners);
	updateJobButtons('tanners','tanner',tannery,1);
	document.getElementById('blacksmiths').innerHTML = prettify(population.blacksmiths);
	updateJobButtons('blacksmiths','blacksmith',smithy,1);
	document.getElementById('apothecaries').innerHTML = prettify(population.apothecaries);
	updateJobButtons('apothecaries','apothecary',apothecary,1);
	document.getElementById('clerics').innerHTML = prettify(population.clerics);
	updateJobButtons('clerics','cleric',temple,1);
	document.getElementById('labourers').innerHTML = prettify(population.labourers);
	updateJobButtons('labourers','labourer',false,false);
	document.getElementById('soldiers').innerHTML = prettify(population.soldiers);
	updateJobButtons('soldiers','soldier',barracks,10);
	document.getElementById('cavalry').innerHTML = prettify(population.cavalry);
	updateJobButtons('cavalry','cavalry',stable,10);
	document.getElementById('corpses').innerHTML = prettify(population.corpses);
	document.getElementById('zombies').innerHTML = prettify(population.zombies);
	document.getElementById('cats').innerHTML = prettify(population.cats);
	document.getElementById('enemiesSlain').innerHTML = prettify(population.enemiesSlain);
}
function updateJobButtons(job,name,building,support){
	var elem = document.getElementById(name + 'group');
	if (building){
		elem.children[0].children[0].disabled = (population[job] <   1); // None
		elem.children[2].children[0].disabled = (population[job] < 100); // -100
		elem.children[3].children[0].disabled = (population[job] <  10); // - 10
		elem.children[4].children[0].disabled = (population[job] <   1); // -  1

		if ((job == 'soldiers' && metal.total >= 10 && leather.total >= 10 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) || (job == 'cavalry' && food.total >= 20 && leather.total >= 20 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) || (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 1 && population[job] + 1 <= building.total * support)){ //1
			elem.children[7].children[0].disabled = false;
		} else {
			elem.children[7].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 100 && leather.total >= 100 && population.unemployed >= 10 && population[job] + 10 <= building.total * support) || (job == 'cavalry' && food.total >= 200 && leather.total >= 200 && population.unemployed >= 10 && population[job] + 10 <= building.total * support) || (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 10 && population[job] + 10 <= building.total * support)){ //10
			elem.children[8].children[0].disabled = false;
		} else {
			elem.children[8].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 1000 && leather.total >= 1000 && population.unemployed >= 100 && population[job] + 100 <= building.total * support) || (job == 'cavalry' && food.total >= 2000 && leather.total >= 2000 && population.unemployed >= 100 && population[job] + 100 <= building.total * support) || (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 100 && population[job] + 100 <= building.total * support)){ //100
			elem.children[9].children[0].disabled = false;
		} else {
			elem.children[9].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 10 && leather.total >= 10 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) || (job == 'cavalry' && food.total >= 20 && leather.total >= 20 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) || (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 1 && population[job] + 1 <= building.total * support)){ //Max
			elem.children[11].children[0].disabled = false;
		} else {
			elem.children[11].children[0].disabled = true;
		}
	} else {
		elem.children[0 ].children[0].disabled = (population[job]       <   1); // None
		elem.children[2 ].children[0].disabled = (population[job]       < 100); // -100
		elem.children[3 ].children[0].disabled = (population[job]       <  10); // - 10
		elem.children[4 ].children[0].disabled = (population[job]       <   1); // -  1
		elem.children[7 ].children[0].disabled = (population.unemployed <   1); //    1
		elem.children[8 ].children[0].disabled = (population.unemployed <  10); //   10
		elem.children[9 ].children[0].disabled = (population.unemployed < 100); //  100
		elem.children[11].children[0].disabled = (population.unemployed <   1); //  Max
	}
	//do something with these later
	//elem.children[ 1].children[0].disabled = false; // -Custom
	//elem.children[10].children[0].disabled = false; //  Custom
}

function updateUpgrades(){
	//Check to see if the player has an upgrade and hide as necessary
	//Check also to see if the player can afford an upgrade and enable/disable as necessary
	//domestication
	if (upgrades.domestication == 1){
		document.getElementById('domesticationLine').style.display = 'none';
		document.getElementById('Pdomestication').style.display = 'block';
	} else {
		document.getElementById('domesticationLine').style.display = 'inline';
		document.getElementById('Pdomestication').style.display = 'none';
		if (leather.total >= 20){
			document.getElementById('domestication').disabled = false;
		} else {
			document.getElementById('domestication').disabled = true;
		}
	}
	//ploughshares
	if (upgrades.ploughshares == 1){
		document.getElementById('ploughsharesLine').style.display = 'none';
		document.getElementById('Pploughshares').style.display = 'block';
	} else {
		document.getElementById('ploughsharesLine').style.display = 'inline';
		document.getElementById('Pploughshares').style.display = 'none';
		if (metal.total >= 20){
			document.getElementById('ploughshares').disabled = false;
		} else {
			document.getElementById('ploughshares').disabled = true;
		}
	}
	//irrigation
	if (upgrades.irrigation == 1){
		document.getElementById('irrigationLine').style.display = 'none';
		document.getElementById('Pirrigation').style.display = 'block';
	} else {
		document.getElementById('irrigationLine').style.display = 'inline';
		document.getElementById('Pirrigation').style.display = 'none';
		if (wood.total >= 500 && stone.total >= 200){
			document.getElementById('irrigation').disabled = false;
		} else {
			document.getElementById('irrigation').disabled = true;
		}
	}
	//skinning
	if (upgrades.skinning == 1){
		document.getElementById('skinningLine').style.display = 'none';
		document.getElementById('Pskinning').style.display = 'block';
	} else {
		document.getElementById('skinningLine').style.display = 'inline';
		document.getElementById('Pskinning').style.display = 'none';
		if (skins.total >= 10){
			document.getElementById('skinning').disabled = false;
		} else {
			document.getElementById('skinning').disabled = true;
		}
	}
	//harvesting
	if (upgrades.harvesting == 1){
		document.getElementById('harvestingLine').style.display = 'none';
		document.getElementById('Pharvesting').style.display = 'block';
	} else {
		document.getElementById('harvestingLine').style.display = 'inline';
		document.getElementById('Pharvesting').style.display = 'none';
		if (herbs.total >= 10){
			document.getElementById('harvesting').disabled = false;
		} else {
			document.getElementById('harvesting').disabled = true;
		}
	}
	//prospecting
	if (upgrades.prospecting == 1){
		document.getElementById('prospectingLine').style.display = 'none';
		document.getElementById('Pprospecting').style.display = 'block';
	} else {
		document.getElementById('prospectingLine').style.display = 'inline';
		document.getElementById('Pprospecting').style.display = 'none';
		if (ore.total >= 10){
			document.getElementById('prospecting').disabled = false;
		} else {
			document.getElementById('prospecting').disabled = true;
		}
	}
	//butchering
	if (upgrades.butchering == 1){
		document.getElementById('butcheringLine').style.display = 'none';
		document.getElementById('Pbutchering').style.display = 'block';
	} else {
		document.getElementById('butcheringLine').style.display = 'inline';
		document.getElementById('Pbutchering').style.display = 'none';
		if (upgrades.skinning && leather.total >= 40){
			document.getElementById('butchering').disabled = false;
		} else {
			document.getElementById('butchering').disabled = true;
		}
	}
	//gardening
	if (upgrades.gardening == 1){
		document.getElementById('gardeningLine').style.display = 'none';
		document.getElementById('Pgardening').style.display = 'block';
	} else {
		document.getElementById('gardeningLine').style.display = 'inline';
		document.getElementById('Pgardening').style.display = 'none';
		if (upgrades.harvesting && herbs.total >= 40){
			document.getElementById('gardening').disabled = false;
		} else {
			document.getElementById('gardening').disabled = true;
		}
	}
	//extraction
	if (upgrades.extraction == 1){
		document.getElementById('extractionLine').style.display = 'none';
		document.getElementById('Pextraction').style.display = 'block';
	} else {
		document.getElementById('extractionLine').style.display = 'inline';
		document.getElementById('Pextraction').style.display = 'none';
		if (upgrades.prospecting && metal.total >= 40){
			document.getElementById('extraction').disabled = false;
		} else {
			document.getElementById('extraction').disabled = true;
		}
	}
	//crop rotation
	if (upgrades.croprotation == 1){
		document.getElementById('cropRotationLine').style.display = 'none';
		document.getElementById('Pcroprotation').style.display = 'block';
	} else {
		document.getElementById('cropRotationLine').style.display = 'inline';
		document.getElementById('Pcroprotation').style.display = 'none';
		if (herbs.total >= 5000 && piety.total >= 1000){
			document.getElementById('croprotation').disabled = false;
		} else {
			document.getElementById('croprotation').disabled = true;
		}
	}
	//selective breeding
	if (upgrades.selectivebreeding == 1){
		document.getElementById('selectiveBreedingLine').style.display = 'none';
		document.getElementById('Pselectivebreeding').style.display = 'block';
	} else {
		document.getElementById('selectiveBreedingLine').style.display = 'inline';
		document.getElementById('Pselectivebreeding').style.display = 'none';
		if (skins.total >= 5000 && piety.total >= 1000){
			document.getElementById('selectivebreeding').disabled = false;
		} else {
			document.getElementById('selectivebreeding').disabled = true;
		}
	}
	//fertilisers
	if (upgrades.fertilisers == 1){
		document.getElementById('fertilisersLine').style.display = 'none';
		document.getElementById('Pfertilisers').style.display = 'block';
	} else {
		document.getElementById('fertilisersLine').style.display = 'inline';
		document.getElementById('Pfertilisers').style.display = 'none';
		if (ore.total >= 5000 && piety.total >= 1000){
			document.getElementById('fertilisers').disabled = false;
		} else {
			document.getElementById('fertilisers').disabled = true;
		}
	}
	//flensing
	if (upgrades.flensing == 1){
		document.getElementById('flensingLine').style.display = 'none';
		document.getElementById('Pflensing').style.display = 'block';
	} else {
		document.getElementById('flensingLine').style.display = 'inline';
		document.getElementById('Pflensing').style.display = 'none';
		if (metal.total >= 1000){
			document.getElementById('flensing').disabled = false;
		} else {
			document.getElementById('flensing').disabled = true;
		}
	}
	//macerating
	if (upgrades.macerating == 1){
		document.getElementById('maceratingLine').style.display = 'none';
		document.getElementById('Pmacerating').style.display = 'block';
	} else {
		document.getElementById('maceratingLine').style.display = 'inline';
		document.getElementById('Pmacerating').style.display = 'none';
		if (leather.total >= 500 && stone.total >= 500){
			document.getElementById('macerating').disabled = false;
		} else {
			document.getElementById('macerating').disabled = true;
		}
	}
	//BUILDING TECHS
	//masonry
	if (upgrades.masonry == 1){
		document.getElementById('masonryLine').style.display = 'none';
		document.getElementById('Pmasonry').style.display = 'block';
		//unlock masonry buildings
		document.getElementById('cottageRow').style.display = 'table-row';
		document.getElementById('tanneryRow').style.display = 'table-row';
		document.getElementById('smithyRow').style.display = 'table-row';
		document.getElementById('apothecaryRow').style.display = 'table-row';
		document.getElementById('templeRow').style.display = 'table-row';
		document.getElementById('barracksRow').style.display = 'table-row';
		//unlock masonry upgrades
		document.getElementById('constructionLine').style.display = 'inline';
		document.getElementById('basicFarming').style.display = 'inline';
		document.getElementById('granariesLine').style.display = 'inline';
		document.getElementById('masonryTech').style.display = 'inline';
	} else {
		document.getElementById('masonryLine').style.display = 'inline';
		document.getElementById('Pmasonry').style.display = 'none';
		if (wood.total >= 100 && stone.total >= 100){
			document.getElementById('masonry').disabled = false;
		} else {
			document.getElementById('masonry').disabled = true;
		}
	}
	//construction
	if (upgrades.construction == 1){
		document.getElementById('constructionLine').style.display = 'none';
		document.getElementById('Pconstruction').style.display = 'block';
		//unlock construction buildings
		document.getElementById('houseRow').style.display = 'table-row';
		//unlock construction upgrades
		document.getElementById('architectureLine').style.display = 'inline';
		document.getElementById('specialFarming').style.display = 'inline';
		document.getElementById('tenementsLine').style.display = 'inline';
		document.getElementById('palisadeLine').style.display = 'inline';
	} else {
		document.getElementById('Pconstruction').style.display = 'none';
		if (upgrades.masonry){
			document.getElementById('constructionLine').style.display = 'inline';
		}
		if (upgrades.masonry && wood.total >= 1000 && stone.total >= 1000){
			document.getElementById('construction').disabled = false;
		} else {
			document.getElementById('construction').disabled = true;
		}
	}
	//architecture
	if (upgrades.architecture == 1){
		document.getElementById('architectureLine').style.display = 'none';
		document.getElementById('Parchitecture').style.display = 'block';
		//unlock architecture buildings
		document.getElementById('mansionRow').style.display = 'table-row';
		document.getElementById('fortificationRow').style.display = 'table-row';
		//unlock architecture upgrades
		document.getElementById('improvedFarming').style.display = 'inline';
		document.getElementById('specFreq').style.display = 'inline';
		document.getElementById('slumsLine').style.display = 'inline';
		document.getElementById('civilserviceLine').style.display = 'inline';
		document.getElementById('wonderLine').style.display = 'inline';
	} else {
		document.getElementById('Parchitecture').style.display = 'none';
		if (upgrades.construction){
			document.getElementById('architectureLine').style.display = 'inline';
		}
		if (upgrades.construction && wood.total >= 10000 && stone.total >= 10000){
			document.getElementById('architecture').disabled = false;
		} else {
			document.getElementById('architecture').disabled = true;
		}
	}
	//wheel
	if (upgrades.wheel == 1){
		document.getElementById('millRow').style.display = 'table-row';
		document.getElementById('wheelLine').style.display = 'none';
		document.getElementById('Pwheel').style.display = 'block';
	} else {
		document.getElementById('wheelLine').style.display = 'inline';
		document.getElementById('Pwheel').style.display = 'none';
		if (wood.total >= 500 && stone.total >= 500){
			document.getElementById('wheel').disabled = false;
		} else {
			document.getElementById('wheel').disabled = true;
		}
	}
	//horseback
	if (upgrades.horseback == 1){
		document.getElementById('stableRow').style.display = 'table-row';
		document.getElementById('fcavalrygroup').style.display = "table-row";
		document.getElementById('horsebackLine').style.display = 'none';
		document.getElementById('Phorseback').style.display = 'block';
	} else {
		document.getElementById('horsebackLine').style.display = 'inline';
		document.getElementById('Phorseback').style.display = 'none';
		if (food.total >= 500 && wood.total >= 500){
			document.getElementById('horseback').disabled = false;
		} else {
			document.getElementById('horseback').disabled = true;
		}
	}
	//tenements
	if (upgrades.tenements == 1){
		document.getElementById('tenementsLine').style.display = 'none';
		document.getElementById('Ptenements').style.display = 'block';
	} else {
		document.getElementById('Ptenements').style.display = 'none';
		if (upgrades.construction){
			document.getElementById('tenementsLine').style.display = 'inline';
		}
		if (upgrades.construction && food.total >= 200 && wood.total >= 500 && stone.total >= 500){
			document.getElementById('tenements').disabled = false;
		} else {
			document.getElementById('tenements').disabled = true;
		}
	}
	//slums
	if (upgrades.slums == 1){
		document.getElementById('slumsLine').style.display = 'none';
		document.getElementById('Pslums').style.display = 'block';
	} else {
		document.getElementById('Pslums').style.display = 'none';
		if (upgrades.architecture){
			document.getElementById('slumsLine').style.display = 'inline';
		}
		if (upgrades.architecture && food.total >= 500 && wood.total >= 1000 && stone.total >= 1000){
			document.getElementById('slums').disabled = false;
		} else {
			document.getElementById('slums').disabled = true;
		}
	}
	//granaries
	if (upgrades.granaries == 1){
		document.getElementById('granariesLine').style.display = 'none';
		document.getElementById('Pgranaries').style.display = 'block';
	} else {
		document.getElementById('Pgranaries').style.display = 'none';
		if (upgrades.masonry){
			document.getElementById('granariesLine').style.display = 'inline';
		}
		if (upgrades.masonry && wood.total >= 1000 && stone.total >= 1000){
			document.getElementById('granaries').disabled = false;
		} else {
			document.getElementById('granaries').disabled = true;
		}
	}
	//palisade
	if (upgrades.palisade == 1){
		document.getElementById('palisadeLine').style.display = 'none';
		document.getElementById('Ppalisade').style.display = 'block';
	} else {
		document.getElementById('Ppalisade').style.display = 'none';
		if (upgrades.construction){
			document.getElementById('palisadeLine').style.display = 'inline';
		}
		if (upgrades.construction && wood.total >= 2000 && stone.total >= 1000){
			document.getElementById('palisade').disabled = false;
		} else {
			document.getElementById('palisade').disabled = true;
		}
	}
	//weaponry
	if (upgrades.weaponry == 1){
		document.getElementById('weaponryLine').style.display = 'none';
		document.getElementById('Pweaponry').style.display = 'block';
	} else {
		document.getElementById('Pweaponry').style.display = 'none';
		if (upgrades.masonry){
			document.getElementById('weaponryLine').style.display = 'inline';
		}
		if (upgrades.masonry && wood.total >= 500 && metal.total >= 500){
			document.getElementById('weaponry').disabled = false;
		} else {
			document.getElementById('weaponry').disabled = true;
		}
	}
	//shields
	if (upgrades.shields == 1){
		document.getElementById('shieldsLine').style.display = 'none';
		document.getElementById('Pshields').style.display = 'block';
	} else {
		document.getElementById('Pshields').style.display = 'none';
		if (upgrades.masonry){
			document.getElementById('shieldsLine').style.display = 'inline';
		}
		if (upgrades.masonry && wood.total >= 500 && leather.total >= 500){
			document.getElementById('shields').disabled = false;
		} else {
			document.getElementById('shields').disabled = true;
		}
	}
	//writing
	if (upgrades.writing == 1){
		document.getElementById('writingTech').style.display = 'block';
		document.getElementById('writingLine').style.display = 'none';
		document.getElementById('Pwriting').style.display = 'block';
	} else {
		document.getElementById('writingTech').style.display = 'none';
		document.getElementById('Pwriting').style.display = 'none';
		if (upgrades.masonry){
			document.getElementById('writingLine').style.display = 'inline';
		}
		if (upgrades.masonry && skins.total >= 500){
			document.getElementById('writing').disabled = false;
		} else {
			document.getElementById('writing').disabled = true;
		}
	}
	//administration
	if (upgrades.administration == 1){
		document.getElementById('administrationLine').style.display = 'none';
		document.getElementById('Padministration').style.display = 'block';
	} else {
		document.getElementById('administrationLine').style.display = 'inline';
		document.getElementById('Padministration').style.display = 'none';
		if (stone.total >= 1000 && skins.total >= 1000){
			document.getElementById('administration').disabled = false;
		} else {
			document.getElementById('administration').disabled = true;
		}
	}
	//code of laws
	if (upgrades.codeoflaws == 1){
		document.getElementById('codeoflawsLine').style.display = 'none';
		document.getElementById('Pcodeoflaws').style.display = 'block';
	} else {
		document.getElementById('codeoflawsLine').style.display = 'inline';
		document.getElementById('Pcodeoflaws').style.display = 'none';
		if (stone.total >= 1000 && skins.total >= 1000){
			document.getElementById('codeoflaws').disabled = false;
		} else {
			document.getElementById('codeoflaws').disabled = true;
		}
	}
	//mathematics
	if (upgrades.mathematics == 1){
		document.getElementById('fsiegegroup').style.display = "table-row";
		document.getElementById('mathematicsLine').style.display = 'none';
		document.getElementById('Pmathematics').style.display = 'block';
	} else {
		document.getElementById('fsiegegroup').style.display = "none";
		document.getElementById('mathematicsLine').style.display = 'inline';
		document.getElementById('Pmathematics').style.display = 'none';
		if (herbs.total >= 1000 && piety.total >= 1000){
			document.getElementById('mathematics').disabled = false;
		} else {
			document.getElementById('mathematics').disabled = true;
		}
	}
	//aesthetics
	if (upgrades.aesthetics == 1){
		document.getElementById('aestheticsLine').style.display = 'none';
		document.getElementById('Paesthetics').style.display = 'block';
	} else {
		document.getElementById('aestheticsLine').style.display = 'inline';
		document.getElementById('Paesthetics').style.display = 'none';
		if (piety.total >= 5000){
			document.getElementById('aesthetics').disabled = false;
		} else {
			document.getElementById('aesthetics').disabled = true;
		}
	}
	//civil service
	if (upgrades.civilservice == 1){
		document.getElementById('civilTech').style.display = 'block';
		document.getElementById('civilserviceLine').style.display = 'none';
		document.getElementById('Pcivilservice').style.display = 'block';
	} else {
		document.getElementById('civilTech').style.display = 'none';
		document.getElementById('Pcivilservice').style.display = 'none';
		if (upgrades.architecture){
			document.getElementById('civilserviceLine').style.display = 'inline';
		}
		if (upgrades.architecture && piety.total >= 5000){
			document.getElementById('civilservice').disabled = false;
		} else {
			document.getElementById('civilservice').disabled = true;
		}
	}
	//feudalism
	if (upgrades.feudalism == 1){
		document.getElementById('feudalismLine').style.display = 'none';
		document.getElementById('Pfeudalism').style.display = 'block';
	} else {
		document.getElementById('feudalismLine').style.display = 'inline';
		document.getElementById('Pfeudalism').style.display = 'none';
		if (piety.total >= 10000){
			document.getElementById('feudalism').disabled = false;
		} else {
			document.getElementById('feudalism').disabled = true;
		}
	}
	//guilds
	if (upgrades.guilds == 1){
		document.getElementById('guildsLine').style.display = 'none';
		document.getElementById('Pguilds').style.display = 'block';
	} else {
		document.getElementById('guildsLine').style.display = 'inline';
		document.getElementById('Pguilds').style.display = 'none';
		if (piety.total >= 10000){
			document.getElementById('guilds').disabled = false;
		} else {
			document.getElementById('guilds').disabled = true;
		}
	}
	//serfs
	if (upgrades.serfs == 1){
		document.getElementById('serfsLine').style.display = 'none';
		document.getElementById('Pserfs').style.display = 'block';
	} else {
		document.getElementById('serfsLine').style.display = 'inline';
		document.getElementById('Pserfs').style.display = 'none';
		if (piety.total >= 20000){
			document.getElementById('serfs').disabled = false;
		} else {
			document.getElementById('serfs').disabled = true;
		}
	}
	//nationalism
	if (upgrades.nationalism == 1){
		document.getElementById('nationalismLine').style.display = 'none';
		document.getElementById('Pnationalism').style.display = 'block';
	} else {
		document.getElementById('nationalismLine').style.display = 'inline';
		document.getElementById('Pnationalism').style.display = 'none';
		if (piety.total >= 50000){
			document.getElementById('nationalism').disabled = false;
		} else {
			document.getElementById('nationalism').disabled = true;
		}
	}
	//deity techs
	if (upgrades.deity == 1){
		document.getElementById('deityLine').style.display = 'none';
		document.getElementById('Pworship').style.display = 'block';
		document.getElementById('renameDeity').disabled = false;
		if (deity.type == ""){
			document.getElementById('deitySpecialisation').style.display = "inline";
		} else {
			document.getElementById('deitySpecialisation').style.display = "none";
		}
		if (deity.type == "Battle"){
			document.getElementById('battleUpgrades').style.display = 'inline';
		} else {
			document.getElementById('battleUpgrades').style.display = 'none';
		}
		if (deity.type == "the Fields"){
			document.getElementById('fieldsUpgrades').style.display = 'inline';
		} else {
			document.getElementById('fieldsUpgrades').style.display = 'none';
		}
		if (deity.type == "the Underworld"){
			document.getElementById('underworldUpgrades').style.display = 'inline';
			document.getElementById('zombieWorkers').style.display = 'inline';
		} else {
			document.getElementById('underworldUpgrades').style.display = 'none';
			document.getElementById('zombieWorkers').style.display = 'none';
		}
		if (deity.type == "Cats"){
			document.getElementById('catsUpgrades').style.display = 'inline';
		} else {
			document.getElementById('catsUpgrades').style.display = 'none';
		}
	} else {
		document.getElementById('deityLine').style.display = 'block';
		document.getElementById('Pworship').style.display = 'none';
		document.getElementById('renameDeity').disabled = true;
	}
	//standard
	if (upgrades.standard == 1){
		document.getElementById('standardLine').style.display = 'none';
		document.getElementById('Pstandard').style.display = 'block';
		document.getElementById('conquest').style.display = 'block';
		updateTargets();
	} else {
		document.getElementById('standardLine').style.display = 'inline';
		document.getElementById('Pstandard').style.display = 'none';
		document.getElementById('conquest').style.display = 'none';
	}
	//cats - lure
	if (upgrades.lure == 1){
		document.getElementById('lure').disabled = true;
		document.getElementById('pLure').style.display = 'table-row';
	}
	//cats - companion
	if (upgrades.companion == 1){
		document.getElementById('companion').disabled = true;
		document.getElementById('pCompanion').style.display = 'table-row';
	}
	//cats - comfort
	if (upgrades.comfort == 1){
		document.getElementById('comfort').disabled = true;
		document.getElementById('pComfort').style.display = 'table-row';
	}
	//fields - blessing
	if (upgrades.blessing == 1){
		document.getElementById('blessing').disabled = true;
		document.getElementById('pBlessing').style.display = 'table-row';
	}
	//fields - waste
	if (upgrades.waste == 1){
		document.getElementById('waste').disabled = true;
		document.getElementById('pWaste').style.display = 'table-row';
	}
	//fields - stay
	if (upgrades.stay == 1){
		document.getElementById('stay').disabled = true;
		document.getElementById('pStay').style.display = 'table-row';
	}
	//battle - riddle
	if (upgrades.riddle == 1){
		document.getElementById('riddle').disabled = true;
		document.getElementById('pRiddle').style.display = 'table-row';
	}
	//battle - throne
	if (upgrades.throne == 1){
		document.getElementById('throne').disabled = true;
		document.getElementById('pThrone').style.display = 'table-row';
	}
	//battle - lament
	if (upgrades.lament == 1){
		document.getElementById('lament').disabled = true;
		document.getElementById('pLament').style.display = 'table-row';
	}
	//underworld - book
	if (upgrades.book == 1){
		document.getElementById('book').disabled = true;
		document.getElementById('pBook').style.display = 'table-row';
	}
	//underworld - feast
	if (upgrades.feast == 1){
		document.getElementById('feast').disabled = true;
		document.getElementById('pFeast').style.display = 'table-row';
	}
	//underworld - secrets
	if (upgrades.secrets == 1){
		document.getElementById('secrets').disabled = true;
		document.getElementById('pSecrets').style.display = 'table-row';
	}
	//trade - trade
	if (upgrades.trade == 1){
		document.getElementById('tradeLine').style.display = 'none';
		document.getElementById('Ptrade').style.display = 'block';
		document.getElementById('tradeUpgradeContainer').style.display = 'block';
	} else {
		document.getElementById('tradeLine').style.display = 'inline';
		document.getElementById('Ptrade').style.display = 'none';
		document.getElementById('tradeUpgradeContainer').style.display = 'none';
	}
	//trade - currency
	if (upgrades.currency == 1){
		document.getElementById('currencyLine').style.display = 'none';
		document.getElementById('Pcurrency').style.display = 'block';
	} else {
		document.getElementById('currencyLine').style.display = 'inline';
		document.getElementById('Pcurrency').style.display = 'none';
		if (gold.total >= 10 && ore.total >= 1000){
			document.getElementById('currency').disabled = false;
		} else {
			document.getElementById('currency').disabled = true;
		}
	}
	//trade - commerce
	if (upgrades.commerce == 1){
		document.getElementById('commerceLine').style.display = 'none';
		document.getElementById('Pcommerce').style.display = 'block';
	} else {
		document.getElementById('commerceLine').style.display = 'inline';
		document.getElementById('Pcommerce').style.display = 'none';
		if (gold.total >= 100 && piety.total >= 10000){
			document.getElementById('commerce').disabled = false;
		} else {
			document.getElementById('commerce').disabled = true;
		}
	}
}

function updateDeity(){
	if (upgrades.deity == 1){
		//Update page with deity details
		document.getElementById('deity' + deity.seniority + 'Name').innerHTML = deity.name;
		if (deity.type) {
			document.getElementById('deity' + deity.seniority + 'Type').innerHTML = ", deity of " + deity.type;
		} else {
			document.getElementById('deity' + deity.seniority + 'Type').innerHTML = "";
		}
		document.getElementById('devotion' + deity.seniority).innerHTML = deity.devotion;
		//Toggles deity types on for later playthroughs.
		if (deity.type == 'Battle'){
			deity.battle = 1;
			if (!achievements.battle){
				gameLog('Achievement Unlocked: Battle');
				achievements.battle = 1;
				updateAchievements();
			}
		}
		if (deity.type == 'the Fields'){
			deity.fields = 1;
			if (!achievements.fields){
				gameLog('Achievement Unlocked: Fields');
				achievements.fields = 1;
				updateAchievements();
			}
		}
		if (deity.type == 'the Underworld'){
			deity.underworld = 1;
			if (!achievements.underworld){
				gameLog('Achievement Unlocked: Underworld');
				achievements.underworld = 1;
				updateAchievements();
			}
		}
		if (deity.type == 'Cats'){
			deity.cats = 1;
			if (!achievements.cats){
				gameLog('Achievement Unlocked: Cats');
				achievements.cats = 1;
				updateAchievements();
			}
		}
		if (deity.battle && deity.fields && deity.underworld && deity.cats && !achievements.fullHouse){
			achievements.fullHouse = 1;
			gameLog('Achievement Unlocked: Full House');
			updateAchievements();
		}
	}
}

function updateOldDeities(){
	var i,j;
	if (deityArray.length > 0){
		document.getElementById('oldDeities').style.display = 'table';
		document.getElementById('iconoclasmGroup').style.display = 'block';
	}
	if (oldDeities){
		document.getElementById('oldDeities').innerHTML = oldDeities;
	} else {
		var append = '<tr><td><b>Name</b></td><td><b>Domain</b></td><td><b>Devotion</b></td></tr>';
		for (i=(deityArray.length - 1);i>=0;i--){
			append += '<tr>';
				for (j=0;j<deityArray[i].length;j++){
					if (j > 0){
						append += '<td>';
						append += deityArray[i][j];
						append += '</td>';
					}
				}
			append += '</tr>';
		}
		document.getElementById('oldDeities').innerHTML = append;
	}
	
}

function updateMobs(){
	//Check through each mob type and update numbers or hide as necessary.
	if (population.wolves > 0){
		document.getElementById('wolfgroup').style.display = 'table-row';
		document.getElementById('wolves').innerHTML = prettify(population.wolves);
	} else {
		document.getElementById('wolfgroup').style.display = 'none';
	}
	if (population.bandits > 0){
		document.getElementById('banditgroup').style.display = 'table-row';
		document.getElementById('bandits').innerHTML = prettify(population.bandits);
	} else {
		document.getElementById('banditgroup').style.display = 'none';
	}
	if (population.barbarians > 0){
		document.getElementById('barbariangroup').style.display = 'table-row';
		document.getElementById('barbarians').innerHTML = prettify(population.barbarians);
	} else {
		document.getElementById('barbariangroup').style.display = 'none';
	}
	if (population.esiege > 0){
		document.getElementById('esiegegroup').style.display = 'table-row';
		document.getElementById('esiege').innerHTML = prettify(population.esiege);
	} else {
		document.getElementById('esiegegroup').style.display = 'none';
	}
	if (population.shades > 0){
		document.getElementById('shadesgroup').style.display = 'table-row';
		document.getElementById('shades').innerHTML = prettify(population.shades);
	} else {
		document.getElementById('shadesgroup').style.display = 'none';
	}
}

function updateDevotion(){
	//Activates or disables availability of devotion upgrades
	document.getElementById('devotion' + deity.seniority).innerHTML = deity.devotion;
	if (deity.type == 'Battle' && deity.devotion >= 10 && !upgrades.riddle){
		document.getElementById('riddle').disabled = false;
	}
	if (deity.type == 'Battle' && deity.devotion >= 20){
		document.getElementById('smiteInvaders').disabled = false;
	}
	if (deity.type == 'Battle' && deity.devotion >= 30 && !upgrades.throne){
		document.getElementById('throne').disabled = false;
	}
	if (deity.type == 'Battle' && deity.devotion >= 40){
		document.getElementById('glory').disabled = false;
	}
	if (deity.type == 'Battle' && deity.devotion >= 50 && !upgrades.lament){
		document.getElementById('lament').disabled = false;
	}
	if (deity.type == 'the Fields' && deity.devotion >= 10 && !upgrades.blessing){
		document.getElementById('blessing').disabled = false;
	}
	if (deity.type == 'the Fields' && deity.devotion >= 20){
		document.getElementById('wickerman').disabled = false;
	}
	if (deity.type == 'the Fields' && deity.devotion >= 30 && !upgrades.waste){
		document.getElementById('waste').disabled = false;
	}
	if (deity.type == 'the Fields' && deity.devotion >= 40){
		document.getElementById('walk').disabled = false;
	}
	if (deity.type == 'the Fields' && deity.devotion >= 50 && !upgrades.stay){
		document.getElementById('stay').disabled = false;
	}
	if (deity.type == 'the Underworld' && deity.devotion >= 10 && !upgrades.book){
		document.getElementById('book').disabled = false;
	}
	if (deity.type == 'the Underworld' && deity.devotion >= 20){
		document.getElementById('raiseDead').disabled = false;
		document.getElementById('raiseDead100').disabled = false;
		document.getElementById('raiseDeadMax').disabled = false;
	}
	if (deity.type == 'the Underworld' && deity.devotion >= 30 && !upgrades.feast){
		document.getElementById('feast').disabled = false;
	}
	if (deity.type == 'the Underworld' && deity.devotion >= 40){
		document.getElementById('shade').disabled = false;
	}
	if (deity.type == 'the Underworld' && deity.devotion >= 50 && !upgrades.secrets){
		document.getElementById('secrets').disabled = false;
	}
	if (deity.type == 'Cats' && deity.devotion >= 10 && !upgrades.lure ){
		document.getElementById('lure').disabled = false;
	}
	if (deity.type == 'Cats' && deity.devotion >= 20){
		document.getElementById('pestControl').disabled = false;
	}
	if (deity.type == 'Cats' && deity.devotion >= 30 && !upgrades.companion ){
		document.getElementById('companion').disabled = false;
	}
	if (deity.type == 'Cats' && deity.devotion >= 40){
		document.getElementById('grace').disabled = false;
	}
	if (deity.type == 'Cats' && deity.devotion >= 50 && !upgrades.comfort ){
		document.getElementById('comfort').disabled = false;
	}
}

function updateRequirements(building){
	//When buildings are built, this increases their costs
	if (building == battleAltar){
		building.require.metal += 50;
		document.getElementById('battleAltarCost').innerHTML = prettify(building.require.metal);
	}
	if (building == fieldsAltar){
		building.require.food += 250;
		building.require.wood += 250;
		document.getElementById('fieldsAltarFoodCost').innerHTML = prettify(building.require.food);
		document.getElementById('fieldsAltarWoodCost').innerHTML = prettify(building.require.wood);
	}
	if (building == underworldAltar){
		building.require.corpses += 1;
		document.getElementById('underworldAltarCost').innerHTML = prettify(building.require.corpses);
	}
	if (building == catAltar){
		building.require.herbs += 50;
		document.getElementById('catAltarCost').innerHTML = prettify(building.require.herbs);
	}
	if (building == mill){
		building.require.stone = Math.floor(100 * (mill.total + 1) * Math.pow(1.05,mill.total));
		document.getElementById('millCostS').innerHTML = prettify(building.require.stone);
		building.require.wood = Math.floor(100 * (mill.total + 1) * Math.pow(1.05,mill.total));
		document.getElementById('millCostW').innerHTML = prettify(building.require.wood);
	}
	if (building == fortification){
		building.require.stone = Math.floor(100 * (fortification.total + 1) * Math.pow(1.05,fortification.total));
		document.getElementById('fortCost').innerHTML = prettify(building.require.stone);
	}
}

function updateAchievements(){
	//Displays achievements if they are unlocked
	//civ size
	if (achievements.hamlet) { document.getElementById('achHamlet').style.display = "block"; }
	if (achievements.village) { document.getElementById('achVillage').style.display = "block"; }
	if (achievements.smallTown) { document.getElementById('achSmallTown').style.display = "block"; }
	if (achievements.largeTown) { document.getElementById('achLargeTown').style.display = "block"; }
	if (achievements.smallCity) { document.getElementById('achSmallCity').style.display = "block"; }
	if (achievements.largeCity) { document.getElementById('achLargeCity').style.display = "block"; }
	if (achievements.metropolis) { document.getElementById('achMetropolis').style.display = "block"; }
	if (achievements.smallNation) { document.getElementById('achSmallNation').style.display = "block"; }
	if (achievements.nation) { document.getElementById('achNation').style.display = "block"; }
	if (achievements.largeNation) { document.getElementById('achLargeNation').style.display = "block"; }
	if (achievements.empire) { document.getElementById('achEmpire').style.display = "block"; }
	//conquest
	if (achievements.raider) { document.getElementById('achRaider').style.display = "block"; }
	if (achievements.engineer) { document.getElementById('achEngineer').style.display = "block"; }
	if (achievements.domination) { document.getElementById('achDomination').style.display = "block"; }
	//happiness
	if (achievements.hated) { document.getElementById('achHated').style.display = "block"; }
	if (achievements.loved) { document.getElementById('achLoved').style.display = "block"; }
	//other population
	if (achievements.plague) { document.getElementById('achPlague').style.display = "block"; }
	if (achievements.ghostTown) { document.getElementById('achGhostTown').style.display = "block"; }
	//cats
	if (achievements.cat) { document.getElementById('achCat').style.display = "block"; }
	if (achievements.glaring) { document.getElementById('achGlaring').style.display = "block"; }
	if (achievements.clowder) { document.getElementById('achClowder').style.display = "block"; }
	//deities
	if (achievements.battle) { document.getElementById('achBattle').style.display = "block"; }
	if (achievements.cats) { document.getElementById('achCats').style.display = "block"; }
	if (achievements.fields) { document.getElementById('achFields').style.display = "block"; }
	if (achievements.underworld) { document.getElementById('achUnderworld').style.display = "block"; }
	if (achievements.fullHouse) { document.getElementById('achFullHouse').style.display = "block"; }
	//wonders
	if (achievements.wonder) { document.getElementById('achWonder').style.display = "block"; }
	if (achievements.seven) { document.getElementById('achSeven').style.display = "block"; }
	//trading
	if (achievements.merchant) { document.getElementById('achMerchant').style.display = "block"; }
	if (achievements.rushed) { document.getElementById('achRushed').style.display = "block"; }
	//other
	if (achievements.neverclick) { document.getElementById('achNeverclick').style.display = "block"; }
}

function updateParty(){
	//updates the party (and enemies)
	document.getElementById('partySoldiers').innerHTML = prettify(population.soldiersParty);
	document.getElementById('partyCavalry').innerHTML = prettify(population.cavalryParty);
	document.getElementById('partySiege').innerHTML = prettify(population.siege);
	document.getElementById('esoldiers').innerHTML = prettify(population.esoldiers);
	document.getElementById('eforts').innerHTML = prettify(population.eforts);
	if (population.esoldiers > 0){
		document.getElementById('esoldiergroup').style.display = 'table-row';
	} else {
		document.getElementById('esoldiergroup').style.display = 'none';
	}
	if (population.eforts > 0){
		document.getElementById('efortgroup').style.display = 'table-row';
	} else {
		document.getElementById('efortgroup').style.display = 'none';
	}
}

function updatePartyButtons(){
	var fsolgroup, fcavgroup, fsgegroup;
	if (!upgrades.standard) { return; }

	fsolgroup = document.getElementById('fsoldiergroup');
	fsolgroup.children[ 0].children[0].disabled = (population.soldiersParty <   1); // None
	fsolgroup.children[ 2].children[0].disabled = (population.soldiersParty < 100); // -100
	fsolgroup.children[ 3].children[0].disabled = (population.soldiersParty <  10); // - 10
	fsolgroup.children[ 4].children[0].disabled = (population.soldiersParty <   1); // -  1
	fsolgroup.children[ 7].children[0].disabled = (population.soldiers      <   1); //    1
	fsolgroup.children[ 8].children[0].disabled = (population.soldiers      <  10); //   10
	fsolgroup.children[ 9].children[0].disabled = (population.soldiers      < 100); //  100
	fsolgroup.children[11].children[0].disabled = (population.soldiers      <   1); //  Max

	fcavgroup = document.getElementById('fcavalrygroup');
	fcavgroup.children[ 0].children[0].disabled = (population.cavalryParty <   1); // None
	fcavgroup.children[ 2].children[0].disabled = (population.cavalryParty < 100); // -100
	fcavgroup.children[ 3].children[0].disabled = (population.cavalryParty <  10); // - 10
	fcavgroup.children[ 4].children[0].disabled = (population.cavalryParty <   1); // -  1
	fcavgroup.children[ 7].children[0].disabled = (population.cavalry      <   1); //    1
	fcavgroup.children[ 8].children[0].disabled = (population.cavalry      <  10); //   10
	fcavgroup.children[ 9].children[0].disabled = (population.cavalry      < 100); //  100
	fcavgroup.children[11].children[0].disabled = (population.cavalry      <   1); //  Max

	fsgegroup = document.getElementById('fsiegegroup');
	fsgegroup.children[ 7].children[0].disabled = 
		(metal.total <   50 || leather.total <   50 || wood.total <   200); //   1
	fsgegroup.children[ 8].children[0].disabled = 
		(metal.total <  500 || leather.total <  500 || wood.total <  2000); //  10
	fsgegroup.children[ 9].children[0].disabled = 
		(metal.total < 5000 || leather.total < 5000 || wood.total < 20000); // 100
	// Siege max disabled; too easy to overspend.
	// fsgegroup.children[11].children[0].disabled = 
	//	(metal.total <   50 || leather.total <   50 || wood.total <   200); // Max
}

// Enable the raid buttons for eligible targets.
function updateTargets(){
	var i;
	var raidButtons = document.getElementsByClassName('raid');
	var curElem = null;
	for(i=0;i<raidButtons.length;++i)
	{
		curElem = raidButtons[i];
		if (civSizes[curElem.dataset.civtype] <= civSizes[targetMax]) 
		{
			curElem.disabled = false;
		}
	}
}

function updateHappiness(){
	//updates the happiness stat
	var text, color;
	//first checks there's someone to be happy or unhappy, not including zombies
	if (population.current < 1){ efficiency.happiness = 1; }

	if (efficiency.happiness > 1.4){
		text = "Blissful";
		color = "#f0f";
	} else if (efficiency.happiness > 1.2){
		text = "Happy";
		color = "#00f";
	} else if (efficiency.happiness > 0.8){
		text = "Content";
		color = "#0b0"; // Was "#0d0" if pop == 0
	} else if (efficiency.happiness > 0.6){
		text = "Unhappy";
		color = "#880";
	} else {
		text = "Angry";
		color = "#f00";
	}

	document.getElementById('happiness').innerHTML = text;
	document.getElementById('happiness').style.color = color;
}

function updateWonder(){
	//updates the display of wonders and wonder building
	if (wonder.building){
		//show building area and labourers
		document.getElementById('labourergroup').style.display = 'table-row';
		document.getElementById('wondersContainer').style.display = 'block';
		if (wonder.completed){
			document.getElementById('inProgress').style.display = 'none';
			document.getElementById('completed').style.display = 'block';
			document.getElementById('speedWonderGroup').style.display = 'none';
		} else {
			document.getElementById('inProgress').style.display = 'block';
			document.getElementById('progressBar').style.width = wonder.progress.toFixed(1) + '%';
			document.getElementById('progressNumber').innerHTML = wonder.progress.toFixed(1);
			document.getElementById('completed').style.display = 'none';
			document.getElementById('speedWonderGroup').style.display = 'block';
		}
	} else {
		//hide building area and labourers
		document.getElementById('labourergroup').style.display = 'none';
		document.getElementById('wondersContainer').style.display = 'none';
	}
	updateWonderList();
}

function updateWonderList(){
	var i,j;
	if (wonder.total > 0){
		//update wonder list
		var wonderhtml = '<tr><td><strong>Name</strong></td><td><strong>Type</strong></td></tr>';
		for (i=(wonder.array.length - 1); i >= 0; i--){
			try {
				wonderhtml += '<tr>';
				for (j=0; j < wonder.array[i].length; j++){
					wonderhtml += '<td>';
					wonderhtml += wonder.array[i][j];
					wonderhtml += '</td>';
				}
				wonderhtml += '</tr>';
			} catch(err){
				console.log('Could not build wonder row ' + i);
			}
		}
		document.getElementById('pastWonders').innerHTML = wonderhtml;
		//handle achievements
		if (!achievements.wonder){
			achievements.wonder = 1;
			gameLog('Achievement Unlocked: Wonder');
			updateAchievements();
		}
		if (!achievements.seven && wonder.food + wonder.wood + wonder.stone + wonder.skins + wonder.herbs + wonder.ore + wonder.leather + wonder.metal + wonder.piety >= 7){
			achievements.seven = 1;
			gameLog('Achievement Unlocked: Seven');
			updateAchievements();
		}
	}
}

function updateBuildingButtons(){
	//enables/disabled building buttons - calls each type of building in turn
	updateBuildingRow(tent,'tent');
	updateBuildingRow(whut,'whut');
	updateBuildingRow(cottage,'cottage');
	updateBuildingRow(house,'house');
	updateBuildingRow(mansion,'mansion');
	updateBuildingRow(barn,'barn');
	updateBuildingRow(woodstock,'woodstock');
	updateBuildingRow(stonestock,'stonestock');
	updateBuildingRow(tannery,'tannery');
	updateBuildingRow(smithy,'smithy');
	updateBuildingRow(apothecary,'apothecary');
	updateBuildingRow(temple,'temple');
	updateBuildingRow(barracks,'barracks');
	updateBuildingRow(stable,'stable');
	updateBuildingRow(graveyard,'graveyard');
	updateBuildingRow(mill,'mill');
	updateBuildingRow(fortification,'fortification');
	updateBuildingRow(battleAltar,'battle');
	updateBuildingRow(underworldAltar,'underworld');
	updateBuildingRow(fieldsAltar,'fields');
	updateBuildingRow(catAltar,'cat');
}
function updateBuildingRow(building,name){
	var i;
	var num;
	//this works by trying to access the children of the table rows containing the buttons in sequence
	for (i=0;i<4;i++){
		//fortunately the index numbers of the children map directly onto the powers of 10 used by the buttons
		num = Math.pow(10,i);
		//check resources based on this num
		if (food.total >= (building.require.food * num) && wood.total >= (building.require.wood * num) && stone.total >= (building.require.stone * num) && skins.total >= (building.require.skins * num) && herbs.total >= (building.require.herbs * num) && ore.total >= (building.require.ore * num) && leather.total >= (building.require.leather * num) && metal.total >= (building.require.metal * num) && piety.total >= (building.require.piety * num) && population.corpses >= (building.require.corpses * num)){
			try { //try-catch required because fortifications and mills do not have more than one child button. This should probably be cleaned up in the future.
				document.getElementById(name + 'Row').children[i].children[0].disabled = false;
			} catch(ignore){}
		} else {
			try {
				document.getElementById(name + 'Row').children[i].children[0].disabled = true;
			} catch(ignore){}
		}		
	}	
	//document.getElementById(name + 'Row').children[4].children[0].disabled = false; //Custom button (do something with this later)
}

function updateReset(){
	document.getElementById('resetNote'  ).style.display = (upgrades.deity || wonder.completed) ? 'inline' : 'none';
	document.getElementById('resetDeity' ).style.display = (upgrades.deity  ) ? 'inline' : 'none';
	document.getElementById('resetWonder').style.display = (wonder.completed) ? 'inline' : 'none';
	document.getElementById('resetBoth'  ).style.display = (upgrades.deity && wonder.completed) ? 'inline' : 'none';
}

function update(){

	//unified update function. NOT YET IMPLEMENTED

	//debugging - mark beginning of function execution
	var start = new Date().getTime();

	//call each existing update subfunction in turn
	updateResourceTotals();
	updateBuildingTotals(); //need to remove call to updatePopulation, move references to upgrades
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
	//console.log('Update loop execution time: ' + time + 'ms'); //temporary altered to return time in order to run a debugging function
	return time;
}


// Game functions

function increment(material){
	//This function is called every time a player clicks on a primary resource button
	resourceClicks += 1;
	document.getElementById("clicks").innerHTML = prettify(Math.round(resourceClicks));
	material.total = material.total + material.increment + (material.increment * 9 * upgrades.civilservice) + (material.increment * 40 * upgrades.feudalism) + (upgrades.serfs * Math.floor(Math.log(population.unemployed * 10 + 1))) + (upgrades.nationalism * Math.floor(Math.log((population.soldiers + population.cavalry) * 10 + 1)));
	//Handles random collection of special resources.
	var x = Math.random();
	if (material == food){
		if (x < material.specialchance){
			skins.total = skins.total + food.increment + (upgrades.guilds * 9 * food.increment);
		}
	}
	if (material == wood){
		if (x < material.specialchance){
			herbs.total = herbs.total + wood.increment + (upgrades.guilds * 9 * wood.increment);
		}
	}
	if (material == stone){
		if (x < material.specialchance){
			ore.total = ore.total + stone.increment + (upgrades.guilds * 9 * stone.increment);
		}
	}
	//Checks to see that resources are not exceeding their caps
	if (food.total > 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200)){
		food.total = 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200);
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
	//First check the building requirements
	if (food.total >= (building.require.food * num) && wood.total >= (building.require.wood * num) && stone.total >= (building.require.stone * num) && skins.total >= (building.require.skins * num) && herbs.total >= (building.require.herbs * num) && ore.total >= (building.require.ore * num) && leather.total >= (building.require.leather * num) && metal.total >= (building.require.metal * num) && piety.total >= (building.require.piety * num) && population.corpses >= (building.require.corpses * num)){
		//Then deduct resources
		food.total = food.total - building.require.food * num;
		wood.total = wood.total - building.require.wood * num;
		stone.total = stone.total - building.require.stone * num;
		skins.total = skins.total - building.require.skins * num;
		herbs.total = herbs.total - building.require.herbs * num;
		ore.total = ore.total - building.require.ore * num;
		leather.total = leather.total - building.require.leather * num;
		metal.total = metal.total - building.require.metal * num;
		piety.total = piety.total - building.require.piety * num;
		population.corpses = population.corpses - building.require.corpses * num;
		//Then increment the total number of that building
		building.total += 1 * num;
		//Increase devotion if the building was an altar.
		deity.devotion += building.devotion * num;
		//If building was graveyard, create graves
		if (building == graveyard) { digGraves(num); }
		//if building was temple and aesthetics has been activated, increase happiness
		if (building == temple && upgrades.aesthetics == 1){
			var templeProp = num * 25 / population.current; //if population is large, temples have less effect
			mood(templeProp);
		}
		updateBuildingButtons(); //Update the buttons themselves
		updateDevotion(); //might be necessary if building was an altar
		updateRequirements(building); //Increases buildings' costs
		updateResourceTotals(); //Update page with lower resource values
		updateBuildingTotals(); //Update page with higher building total
		//Then check for overcrowding
		if (totalBuildings > land){
			gameLog('You are suffering from overcrowding.');
			if (upgrades.codeoflaws){
				mood(num * -0.0025);
			} else {
				mood(num * -0.005);
			}
		}
		updateJobs(); //Update page with individual worker numbers, can't remember why this is called here
	} else {
		gameLog("Could not build, insufficient resources.");
	}
}

function getCustomNumber(elemId){
	var elem = document.getElementById(elemId);
	var num = elem.value;
	//Here we must coerce the variable type to be a number for browsers such
	//as Firefox, which don't understand the number type for input elements.
	//If this fails, it should return NaN so we can exclude that later.
	num = num - 0;
	//then we make sure it's an integer and at least 0
	num = Math.floor(num);
	if (num < 1)  { num = NaN; }

	//finally, check the above operations haven't returned NaN
	if (isNaN(num)){
		elem.style.background = "#f99"; //notify user that the input failed
		return 0;
	} 

	elem.value = num; //reset fractional numbers, check nothing odd happened
	elem.style.background = "#fff";

	return num;
}
function getCustomBuildNumber() { return getCustomNumber('buildCustom'); }
function getCustomSpawnNumber() { return getCustomNumber('spawnCustom'); }
function getCustomJobNumber()   { return getCustomNumber('jobCustom'  ); }

//builds a custom number of buildings
function buildCustom(building) { createBuilding(building,getCustomBuildNumber()); }

function calcCost(num){
	//Calculates and returns the cost of adding a certain number of workers at the present population
	//First set temporary values
	var aggCost = 0,
		currentPrice = 0,
		popCurrentTemp = population.current;
	var i;
	//Then iterate through adding workers, and increment temporary values
	for (i=0; i<num; i++){
			currentPrice = 20 + Math.floor(popCurrentTemp / 100); //CURRENT FOOD COST CALCULATION
			//currentPrice = Math.floor(20 * Math.pow(1.005,popCurrentTemp / 1500) + popCurrentTemp / 100); //POTENTIAL NEW COST CALCULATION
			aggCost += currentPrice;
			popCurrentTemp += 1;
	}
	//Finally, return the aggregated cost to the function that called this one.
	return aggCost;
}

function spawn(num){
	//Creates more workers
	//First get the potential cost
	var totalCost = calcCost(num);
	//Then check that the player can afford the cost and has enough space under their popcap
	if (food.total >= totalCost && population.current + (1 * num) <= population.cap){
		//Increment population numbers, reduce food
		population.current += num;
		population.farmers += num; // New workers start as farmers
		food.total -= totalCost;
		//Potentially create a cat
		//This is intentionally independent of the number of workers spawned
		var c = Math.random() * 100;
		if (c < 1 + upgrades.lure) {
			population.cats += 1;
			if (population.cats >= 1 && !achievements.cat){
				gameLog('Achievement Unlocked: Cat!');
				achievements.cat = 1;
			}
			if (population.cats >= 10 && !achievements.glaring){
				gameLog('Achievement Unlocked: Glaring');
				achievements.glaring = 1;
			}
			if (population.cats >= 100 && !achievements.clowder){
				gameLog('Achievement Unlocked: Clowder');
				achievements.clowder = 1;
			}
			updateAchievements();
			document.getElementById('cats').innerHTML = population.cats; //Possibly unnecessary
		}
		updateResourceTotals(); //update with new lower resource number
		updatePopulation(); //Run through the population->job update cycle
	}
}

//calls the spawn function with the custom number from the input
function spawnCustom() { spawn(getCustomSpawnNumber); }

function jobCull(){
	//This should probably be renamed the starve function. Culls workers when they starve, in a specific order.
	if (population.unemployedIll > 0){ population.unemployedIll -= 1; }
	else if (population.blacksmithsIll > 0){ population.blacksmithsIll -= 1; }
	else if (population.tannersIll > 0){ population.tannersIll -= 1; }
	else if (population.minersIll > 0){ population.minersIll -= 1; }
	else if (population.woodcuttersIll > 0){ population.woodcuttersIll -= 1; }
	else if (population.clericsIll > 0){ population.clericsIll -= 1; }
	else if (population.cavalryIll > 0){
		population.cavalryIll -= 1;
		population.cavalryCasIll -= 1;
		if (population.cavalryCasIll < 0) { population.cavalryCasIll = 0; }
	} else if (population.soldiersIll > 0){
		population.soldiersIll -= 1;
		population.soldiersCasIll -= 1;
		if (population.soldiersCasIll < 0) { population.soldiersCasIll = 0; }
	} else if (population.apothecariesIll > 0){ population.apothecariesIll -= 1; }
	else if (population.labourersIll > 0){ population.labourersIll -= 1; }
	else if (population.farmersIll > 0){ population.farmersIll -= 1; }
	else if (population.unemployed > 0){ population.unemployed -= 1; }
	else if (population.blacksmiths > 0){ population.blacksmiths -= 1; }
	else if (population.tanners > 0){ population.tanners -= 1; }
	else if (population.miners > 0){ population.miners -= 1; }
	else if (population.woodcutters > 0){ population.woodcutters -= 1; }
	else if (population.labourers > 0){ population.labourers -= 1; }
	else if (population.clerics > 0){ population.clerics -= 1; }
	else if (population.cavalry > 0){
		population.cavalry -= 1;
		population.cavalryCas -= 1;
		if (population.cavalryCas < 0) { population.cavalryCas = 0; }
	} else if (population.soldiers > 0){
		population.soldiers -= 1;
		population.soldiersCas -= 1;
		if (population.soldiersCas < 0) { population.soldiersCas = 0; }
	} else if (population.apothecaries > 0){ population.apothecaries -= 1; }
	else if (population.farmers > 0){ population.farmers -= 1; }
	else if (population.cavalryParty > 0){
		population.cavalryParty -= 1;
		population.cavalryPartyCas -= 1;
		if (population.cavalryPartyCas < 0) { population.cavalryPartyCas = 0; }
		updateParty();
	} else if (population.soldiersParty > 0) {
		population.soldiersParty -= 1;
		population.soldiersPartyCas -= 1;
		if (population.soldiersPartyCas < 0) { population.soldiersPartyCas = 0; }
		updateParty();
	}
	//Increments corpse number
	population.corpses += 1;
	//Workers dying may trigger Book of the Dead
	if (upgrades.book) {
		piety.total += 10;
	}
}

//Adds unemployed workers to a specific job. Unfortunately the job variable has to be passed as a string for some reason, hence the if statements.
function hire(job,num){
	if (population.unemployed < num) { return; }
	
	if (job == 'farmers'){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'woodcutters'){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'miners'){
		population[job] += num;
		population.unemployed -= num;
	}
	//Jobs that require buildings
	if (job == 'tanners' && tannery.total >= (population.tanners + population.tannersIll + num)){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'blacksmiths' && smithy.total >= (population.blacksmiths + population.blacksmithsIll + num)){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'apothecaries' && apothecary.total >= (population.apothecaries + population.apothecariesIll + num)){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'clerics' && temple.total >= (population.clerics + population.clericsIll + num)){
		population[job] += num;
		population.unemployed -= num;
	}
	if (job == 'labourers'){
		population[job] += num;
		population.unemployed -= num;
	}
	//Soldiers require buildings and resources
	if (job == 'soldiers' && barracks.total >= ((population.soldiers + population.soldiersIll + population.soldiersParty + num) / 10) && metal.total >= (10 * num) && leather.total >= (10 * num)){
		population[job] += num;
		population.unemployed -= num;
		population.soldiersCas += num;
		metal.total -= (10 * num);
		leather.total -= (10 * num);
	}
	//as do cavalry
	if (job == 'cavalry' && stable.total >= ((population.cavalry + population.cavalryIll + population.cavalryParty + num) / 10) && food.total >= (20 * num) && leather.total >= (20 * num)){
		population[job] += num;
		population.unemployed -= num;
		population.cavalryCas += num;
		food.total -= (20 * num);
		leather.total -= (20 * num);
	}
	updateJobs(); //Updates the page with the num in each job.
}
function hireAll(job){
	//Tries to assign all unemployed workers to a job, subbing in population.unemployed for the variable the hire function would ordinarily be passed.
	//Works similarly to the hire() function above. There may be a better way to do this/merge the two functions.
	var num = Infinity;

	if (job == 'tanners'){
		num = tannery.total - (population[job] + population.tannersIll);
	}
	if (job == 'blacksmiths'){
		num = smithy.total - (population[job] + population.tannersIll);
	}
	if (job == 'apothecaries'){
		num = apothecary.total - (population[job] + population.apothecariesIll);
	}
	if (job == 'clerics'){
		num = temple.total - (population[job] + population.clericsIll);
	}
	if (job == 'soldiers'){
		num = (barracks.total * 10) - (population[job] + population.soldiersIll + population.soldiersParty);
		num = Math.min(num,Math.floor(leather.total / 10),Math.floor(metal.total / 10));
	}
	if (job == 'cavalry'){
		num = (stable.total * 10) - (population[job] + population.cavalryIll + population.cavalryParty);
		num = Math.mun(num,Math.floor(leather.total / 10),Math.floor(food.total / 10));
	}

	hire(job,Math.min(num, population.unemployed));
}

function fire(job,num){
	//See above hire() function, works the same way but in reverse.
	//May also be possible to consolidate with hire function, by hiring negative num. Will investigate.
	if (population[job] < num) { return; }

	population[job] -= num;
	population.unemployed += num;
	
	if (job == 'soldiers'){
		population.soldiersCas -= num;
		metal.total += (10 * num); // Return equipment to armory
		leather.total += (10 * num);
		//It's possible that firing the last soldier, if injured, could put population.soldiersCas negative
		if (population.soldiersCas < 0){
			population.soldiersCas = 0;
		}
	}
	if (job == 'cavalry'){
		population.cavalryCas -= num;
		food.total += (20 * num); // Return equipment to armory
		leather.total += (20 * num);
		//It's possible that firing the last cavalry, if injured, could put population.cavalryCas negative
		if (population.cavalryCas < 0){
			population.cavalryCas = 0;
		}
	}
	updateJobs();
}

//See hireAll() function. Assigns all workers in a particular job to the unemployed pool.
function fireAll(job) { fire(job,population[job]); }

//calls the hire/fire function with the custom num from the input
function fireCustom(worker) { fire(worker,getCustomJobNumber()); }
function hireCustom(worker) { hire(worker,getCustomJobNumber()); }

function raiseDead(num){
	//Attempts to convert corpses into zombies
	if (num == "max"){
		var maximum = Math.min(population.corpses,Math.floor(piety.total/100));
		population.corpses -= maximum;
		population.zombies += maximum;
		population.unemployed += maximum;
		piety.total -= (maximum * 100);
	} else if (population.corpses >= num && piety.total >= (100 * num)){
		//Update numbers and resource levels
		population.unemployed += num;
		population.zombies += num;
		population.corpses -= num;
		piety.total -= (100 * num);
		//Notify player
		if (num == 1) {
			gameLog("A corpse rises, eager to do your bidding.");
		} else {
			gameLog("The corpses rise, eager to do your bidding.");
		}
	} else if (population.corpses >= num){
		gameLog('Not enough piety');
	} else {
		gameLog('Not enough corpses');
	}
	updatePopulation(); //Run through population->jobs cycle to update page with zombie and corpse totals
	updateResourceTotals(); //Update any piety spent
}

function shade(){
	if (piety.total >= 1000){
		if (population.enemiesSlain > 0){
			piety.total -= 1000;
			var number = Math.ceil(population.enemiesSlain/4 + (Math.random() * population.enemiesSlain/4));
			population.enemiesSlain -= number;
			population.shades += number;
		}
	}
}

function upgrade(name){
	//Called whenever player clicks a button to try to buy an upgrade.
	//If the player has the resources, toggles the upgrade on and does stuff dependent on the upgrade.
	if (name == 'domestication' && leather.total >= 20){
		upgrades.domestication = 1;
		leather.total -= 20;
		efficiency.farmers += 0.1;
	}
	if (name == 'ploughshares' && metal.total >= 20){
		upgrades.ploughshares = 1;
		metal.total -= 20;
		efficiency.farmers += 0.1;
	}
	if (name == 'irrigation' && wood.total >= 500 && stone.total >= 200){
		upgrades.irrigation = 1;
		wood.total -= 500;
		stone.total -= 200;
		efficiency.farmers += 0.1;
	}
	if (name == 'skinning' && skins.total >= 10){
		upgrades.skinning = 1;
		skins.total -= 10;
		document.getElementById('butchering').disabled = false; //Unlock Butchering
	}
	if (name == 'harvesting' && herbs.total >= 10){
		upgrades.harvesting = 1;
		herbs.total -= 10;
		document.getElementById('gardening').disabled = false; //Unlock Gardening
	}
	if (name == 'prospecting' && ore.total >= 10){
		upgrades.prospecting = 1;
		ore.total -= 10;
		document.getElementById('extraction').disabled = false; //Unlock Extraction
	}
	if (name == 'butchering' && leather.total >= 40 && upgrades.skinning == 1){
		upgrades.butchering = 1;
		leather.total -= 40;
	}
	if (name == 'gardening' && herbs.total >= 40 && upgrades.harvesting == 1){
		upgrades.gardening = 1;
		herbs.total -= 40;
	}
	if (name == 'extraction' && metal.total >= 40 && upgrades.prospecting == 1){
		upgrades.extraction = 1;
		metal.total -= 40;
	}
	if (name == 'croprotation' && herbs.total >= 5000 && piety.total >= 1000){
		upgrades.croprotation = 1;
		herbs.total -= 5000;
		piety.total -= 1000;
		efficiency.farmers += 0.1;
	}
	if (name == 'selectivebreeding' && skins.total >= 5000 && piety.total >= 1000){
		upgrades.selectivebreeding = 1;
		skins.total -= 5000;
		piety.total -= 1000;
		efficiency.farmers += 0.1;
	}
	if (name == 'fertilisers' && ore.total >= 5000 && piety.total >= 1000){
		upgrades.fertilisers = 1;
		ore.total -= 5000;
		piety.total -= 1000;
		efficiency.farmers += 0.1;
	}
	if (name == 'masonry' && wood.total >= 100 && stone.total >= 100){
		upgrades.masonry = 1;
		wood.total -= 100;
		stone.total -= 100;
	}
	if (name == 'construction' && upgrades.masonry && wood.total >= 1000 && stone.total >= 1000){
		upgrades.construction = 1;
		wood.total -= 1000;
		stone.total -= 1000;
	}
	if (name == 'architecture' && upgrades.construction && wood.total >= 10000 && stone.total >= 10000){
		upgrades.architecture = 1;
		wood.total -= 10000;
		stone.total -= 10000;
	}
	if (name == 'wheel' && wood.total >= 500 && stone.total >= 500){
		upgrades.wheel = 1;
		wood.total -= 500;
		stone.total -= 500;
	}
	if (name == 'horseback' && food.total >= 500 && wood.total >= 500){
		upgrades.horseback = 1;
		food.total -= 500;
		wood.total -= 500;
	}
	if (name == 'tenements' && food.total >= 200 && wood.total >= 500 && stone.total >= 500){
		upgrades.tenements = 1;
		food.total -= 200;
		wood.total -= 500;
		stone.total -= 500;
		updatePopulation(); //due to population limits changing
	}
	if (name == 'slums' && food.total >= 500 && wood.total >= 1000 && stone.total >= 1000){
		upgrades.slums = 1;
		food.total -= 500;
		wood.total -= 1000;
		stone.total -= 1000;
		updatePopulation(); //due to population limits changing
	}
	if (name == 'granaries' && wood.total >= 1000 && stone.total >= 1000){
		upgrades.granaries = 1;
		wood.total -= 1000;
		stone.total -= 1000;
		updateBuildingTotals(); //due to resource limits increasing
	}
	if (name == 'palisade' && wood.total >= 2000 && stone.total >= 1000){
		upgrades.palisade = 1;
		wood.total -= 2000;
		stone.total -= 1000;
	}
	if (name == 'weaponry' && wood.total >= 500 && metal.total >= 500){
		upgrades.weaponry = 1;
		wood.total -= 500;
		metal.total -= 500;
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
	}
	if (name == 'shields' && wood.total >= 500 && leather.total >= 500){
		upgrades.shields = 1;
		wood.total -= 500;
		leather.total -= 500;
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
	}
	if (name == 'writing' && skins.total >= 500){
		upgrades.writing = 1;
		skins.total -= 500;
	}
	if (name == 'administration' && skins.total >= 1000 && stone.total >= 1000){
		upgrades.administration = 1;
		skins.total -= 1000;
		stone.total -= 1000;
	}
	if (name == 'codeoflaws' && skins.total >= 1000 && stone.total >= 1000){
		upgrades.codeoflaws = 1;
		skins.total -= 1000;
		stone.total -= 1000;
	}
	if (name == 'mathematics' && herbs.total >= 1000 && piety.total >= 1000){
		upgrades.mathematics = 1;
		herbs.total -= 1000;
		piety.total -= 1000;
	}
	if (name == 'aesthetics' && piety.total >= 5000){
		upgrades.aesthetics = 1;
		piety.total -= 5000;
	}
	if (name == 'civilservice' && piety.total >= 5000){
		upgrades.civilservice = 1;
		piety.total -= 5000;
	}
	if (name == 'feudalism' && piety.total >= 10000){
		upgrades.feudalism = 1;
		piety.total -= 10000;
	}
	if (name == 'guilds' && piety.total >= 10000){
		upgrades.guilds = 1;
		piety.total -= 10000;
	}
	if (name == 'serfs' && piety.total >= 20000){
		upgrades.serfs = 1;
		piety.total -= 20000;
	}
	if (name == 'nationalism' && piety.total >= 50000){
		upgrades.nationalism = 1;
		piety.total -= 50000;
	}
	if (name == 'flensing' && metal.total >= 1000){
		upgrades.flensing = 1;
		metal.total -= 1000;
		food.specialchance += 0.1;
	}
	if (name == 'macerating' && leather.total >= 500 && stone.total >= 500){
		upgrades.macerating = 1;
		leather.total -= 500;
		stone.total -= 500;
		stone.specialchance += 0.1;
	}
	if (name == 'standard' && metal.total >= 1000 && leather.total >= 1000){
		upgrades.standard = 1;
		metal.total -= 1000;
		leather.total -= 1000;
	}
	if (name == 'deity' && piety.total >= 1000){
		upgrades.deity = 1;
		piety.total -= 1000;
		//Unlocks deity specialisation, ability to rename deity
		document.getElementById('renameDeity').disabled = false;
		document.getElementById('deitySpecialisation').style.display = "inline";
		renameDeity(); //Calls the rename deity function straight away so that players get to name their deity.
		//Need to add in some handling for when this returns NULL.
	}
	//Deity specialisation upgrades
	if (name == 'deityBattle' && piety.total >= 500){
		deity.type = "Battle";
		deity.battle = 1;
		piety.total -= 500;
		document.getElementById('deitySpecialisation').style.display = "none";
		document.getElementById('battleUpgrades').style.display = "inline";
		updateDeity();
	}
	if (name == 'deityFields' && piety.total >= 500){
		deity.type = "the Fields";
		deity.fields = 1;
		piety.total -= 500;
		document.getElementById('deitySpecialisation').style.display = "none";
		document.getElementById('fieldsUpgrades').style.display = "inline";
		updateDeity();
	}
	if (name == 'deityUnderworld' && piety.total >= 500){
		deity.type = "the Underworld";
		deity.underworld = 1;
		piety.total -= 500;
		document.getElementById('deitySpecialisation').style.display = "none";
		document.getElementById('underworldUpgrades').style.display = "inline";
		updateDeity();
	}
	if (name == 'deityCats' && piety.total >= 500){
		deity.type = "Cats";
		deity.cats = 1;
		piety.total -= 500;
		document.getElementById('deitySpecialisation').style.display = "none";
		document.getElementById('catsUpgrades').style.display = "inline";
		updateDeity();
	}
	//Deity specific updates.
	if (name == 'lure' && piety.total >= 1000){
		upgrades.lure = 1;
		piety.total -= 1000;
		document.getElementById('lure').disabled = true;
		updateDeity();
	}
	if (name == 'companion' && piety.total >= 1000){
		upgrades.companion = 1;
		piety.total -= 1000;
		document.getElementById('companion').disabled = true;
		updateDeity();
	}
	if (name == 'comfort' && piety.total >= 5000){
		upgrades.comfort = 1;
		piety.total -= 5000;
		document.getElementById('comfort').disabled = true;
		updateDeity();
	}
	if (name == 'blessing' && piety.total >= 1000){
		upgrades.blessing = 1;
		piety.total -= 1000;
		efficiency.farmers += 0.1;
		document.getElementById('blessing').disabled = true;
		updateDeity();
	}
	if (name == 'waste' && piety.total >= 1000){
		upgrades.waste = 1;
		piety.total -= 1000;
		document.getElementById('waste').disabled = true;
		updateDeity();
	}
	if (name == 'stay' && piety.total >= 5000){
		upgrades.stay = 1;
		piety.total -= 5000;
		document.getElementById('stay').disabled = true;
		updateDeity();
	}
	if (name == 'riddle' && piety.total >= 1000){
		upgrades.riddle = 1;
		piety.total -= 1000;
		efficiency.soldiers += 0.01;
		efficiency.cavalry += 0.01;
		document.getElementById('riddle').disabled = true;
		updateDeity();
	}
	if (name == 'throne' && piety.total >= 1000){
		upgrades.throne = 1;
		piety.total -= 1000;
		document.getElementById('throne').disabled = true;
		updateDeity();
	}
	if (name == 'lament' && piety.total >= 5000){
		upgrades.lament = 1;
		piety.total -= 5000;
		document.getElementById('lament').disabled = true;
		updateDeity();
	}
	if (name == 'book' && piety.total >= 1000){
		upgrades.book = 1;
		piety.total -= 1000;
		document.getElementById('book').disabled = true;
		updateDeity();
	}
	if (name == 'feast' && piety.total >= 1000){
		upgrades.feast = 1;
		piety.total -= 1000;
		document.getElementById('feast').disabled = true;
		updateDeity();
	}
	if (name == 'secrets' && piety.total >= 5000){
		upgrades.secrets = 1;
		piety.total -= 5000;
		document.getElementById('secrets').disabled = true;
		updateDeity();
	}
	if (name == 'trade' && gold.total >= 1){
		upgrades.trade = 1;
		gold.total -= 1;
		document.getElementById('tradeUpgrade').disabled = true;
	}
	if (name == 'currency' && gold.total >= 10 && ore.total >= 1000){
		upgrades.currency = 1;
		gold.total -= 10;
		ore.total -= 1000;
		document.getElementById('currency').disabled = true;
	}
	if (name == 'commerce' && gold.total >= 100 && piety.total >= 10000){
		upgrades.commerce = 1;
		gold.total -= 100;
		piety.total -= 10000;
		document.getElementById('commerce').disabled = true;
	}
	updateUpgrades(); //Update which upgrades are available to the player
	updateResourceTotals(); //Update reduced resource totals as appropriate.
}

function digGraves(num){
	//Creates new unfilled graves.
	population.graves += 100 * num;
	updatePopulation(); //Update page with grave numbers
}

function randomWorker(){
	//Selects a random healthy worker based on their proportions in the current job distribution.
	var num = Math.random(),
		pUnemployed = population.unemployed / population.healthy,
		pFarmer = population.farmers / population.healthy,
		pWoodcutter = population.woodcutters / population.healthy,
		pMiner = population.miners / population.healthy,
		pTanner = population.tanners / population.healthy,
		pBlacksmith = population.blacksmiths / population.healthy,
		pApothecary = population.apothecaries / population.healthy,
		pCleric = population.clerics / population.healthy,
		pLabourer = population.labourers / population.healthy,
		pCavalry = population.cavalry / population.healthy,
		pSoldier = population.soldiers / population.healthy;
	if (num <= pUnemployed) 
		{ return 'unemployed'; }
	if (num <= pUnemployed + pFarmer)
		{ return 'farmer'; }
	if (num <= pUnemployed + pFarmer + pWoodcutter)
		{ return 'woodcutter'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner)
		{ return 'miner'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner)
		{ return 'tanner'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith)
		{ return 'blacksmith'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pApothecary)
		{ return 'apothecary'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pApothecary + pCleric)
		{ return 'cleric'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pApothecary + pCleric + pLabourer)
		{ return 'labourer'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pApothecary + pCleric + pLabourer + pCavalry)
		{ return 'cavalry'; } 

	return 'soldier';
}

function wickerman(){
	//Selects a random worker, kills them, and then adds a random resource
	if (population.healthy > 0 && wood.total >= 500){
		//Select and kill random worker
		var selected = randomWorker();
		if (selected == 'unemployed'){
			population.unemployed -= 1;
		}
		if (selected == 'farmer'){
			population.farmers -= 1;
		}
		if (selected == 'woodcutter'){
			population.woodcutters -= 1;
		}
		if (selected == 'miner'){
			population.miners -= 1;
		}
		if (selected == 'tanner'){
			population.tanners -= 1;
		}
		if (selected == 'blacksmith'){
			population.blacksmiths -= 1;
		}
		if (selected == 'apothecary'){
			population.apothecaries -= 1;
		}
		if (selected == 'cleric'){
			population.clerics -= 1;
		}
		if (selected == 'labourer'){
			population.labourers -= 1;
		}
		if (selected == 'soldier'){
			population.soldiers -= 1;
			population.soldiersCas -= 1;
			//Killing the last soldier can send population.soldiersCas negative
			if (population.soldiersCas < 0) { population.soldiersCas = 0; }
		}
		if (selected == 'cavalry'){
			population.cavalry -= 1;
			population.cavalryCas -= 1;
			if (population.cavalryCas < 0) { population.cavalryCas = 0; }
		}
		//Remove wood
		wood.total -= 500;
		//Select a random resource (not piety)
		var num = Math.random();
		if (num < 1/8){
			food.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The crops are abundant!");
		} else if (num < 2/8){
			wood.total += Math.floor((Math.random() * 500) + 500);
			gameLog("Burned a " + selected + ". The trees grow stout!");
		} else if (num < 3/8){
			stone.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The stone splits easily!");
		} else if (num < 4/8){
			skins.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The animals are healthy!");
		} else if (num < 5/8){
			herbs.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The gardens flourish!");
		} else if (num < 6/8){
			ore.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". A new vein is struck!");
		} else if (num < 7/8){
			leather.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The tanneries are productive!");
		} else {
			metal.total += Math.floor((Math.random() * 1000));
			gameLog("Burned a " + selected + ". The steel runs pure.");
		}
		updateResourceTotals(); //Adds new resources
		updatePopulation(); //Removes killed worker
	}
}

function walk(increment){
	if(increment){
		walkTotal += increment;
		document.getElementById('ceaseWalk').disabled = false;
		document.getElementById('walkStat').innerHTML = prettify(walkTotal);
		document.getElementById('walkGroup').style.display = 'inline';
	} else {
		walkTotal = 0;
		document.getElementById('ceaseWalk').disabled = true;
		document.getElementById('walkGroup').style.display = 'none';
	}
}

function pestControl(length){
	//First check player has sufficient piety
	if (piety.total >= 100){
		//Set food production bonus and set timer
		efficiency.pestBonus = 0.1;
		pestTimer = length * population.cats;
		//Inform player
		gameLog("The vermin are exterminated.");
		//Deduct piety
		piety.total -= 100;
	}
}

function plague(sickNum){
	//Selects random workers, transfers them to their Ill variants
	var actualNum = 0;
	var i;
	var selected;

	updatePopulation();
	for (i=0;i<sickNum;i++){
		if (population.healthy > 0){ //Makes sure there is someone healthy to get ill.
			if (population.current > 0){ //Makes sure zombies aren't getting ill.
				selected = randomWorker();
				actualNum += 1;
				if (selected == 'unemployed' && population.unemployed > 0){
					population.unemployed -= 1;
					population.unemployedIll += 1;
				}
				if (selected == 'farmer' && population.farmers > 0){
					population.farmers -= 1;
					population.farmersIll += 1;
				}
				if (selected == 'woodcutter' && population.woodcutters > 0){
					population.woodcutters -= 1;
					population.woodcuttersIll += 1;
				}
				if (selected == 'miner' && population.miners > 0){
					population.miners -= 1;
					population.minersIll += 1;
				}
				if (selected == 'tanner' && population.tanners > 0){
					population.tanners -= 1;
					population.tannersIll += 1;
				}
				if (selected == 'blacksmith' && population.blacksmiths > 0){
					population.blacksmiths -= 1;
					population.blacksmithsIll += 1;
				}
				if (selected == 'apothecary' && population.apothecaries > 0){
					population.apothecaries -= 1;
					population.apothecariesIll += 1;
				}
				if (selected == 'cleric' && population.clerics > 0){
					population.clerics -= 1;
					population.clericsIll += 1;
				}
				if (selected == 'labourer' && population.labourers > 0){
					population.labourers -= 1;
					population.labourersIll += 1;
				}
				if (selected == 'soldier' && population.soldiers > 0){
					population.soldiers -= 1;
					population.soldiersCas -= 1;
					population.soldiersIll +=1;
					population.soldiersCasIll +=1;
				}
				if (selected == 'cavalry' && population.cavalry > 0){
					population.cavalry -= 1;
					population.cavalryCas -= 1;
					population.cavalryIll +=1;
					population.cavalryCasIll +=1;
				}
			}
			//COPIED FROM updatePopulation();
			population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.apothecariesIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
			population.healthy = population.unemployed + population.farmers + population.woodcutters + population.miners + population.tanners + population.blacksmiths + population.apothecaries + population.clerics + population.labourers + population.soldiers + population.cavalry - population.zombies;
			population.current = population.healthy + population.totalSick + population.soldiersParty + population.cavalryParty;
		}
	}
	updatePopulation();
	console.log('Plague: ' + actualNum + ' workers affected.');
	gameLog(prettify(actualNum) + ' workers got sick'); //notify player
	if (population.totalSick > population.healthy && !achievements.plague){ //Plagued achievement requires sick people to outnumber healthy
		achievements.plague = 1;
		gameLog('Achievement Unlocked: Plagued');
		updateAchievements();
	}
}

/* Iconoclasm */

function iconoclasmList(){
	var i;
	//Lists the deities for removing
	if (piety.total >= 1000){
		piety.total -= 1000;
		updateResourceTotals();
		document.getElementById('iconoclasm').disabled = true;
		var append = '<br />';
		for (i=(deityArray.length - 1);i>=0;i--){
			if (deityArray[i][0]){
				append += '<button onclick="iconoclasm(' + i + ')">';
				append += deityArray[i][1];
				append += '</button><br />';
			}
		}
		append += '<br /><button onclick=\'iconoclasm("cancel")\'>Cancel</button>';
		document.getElementById('iconoclasmList').innerHTML = append;
	}
}

function iconoclasm(index){
	//will splice a deity from the deityArray unless the user has cancelled
	document.getElementById('iconoclasmList').innerHTML = '';
	document.getElementById('iconoclasm').disabled = false;
	if (index == 'cancel'){
		//return the piety
		piety.total += 1000;
	} else {
		//give gold
		if (deityArray[index][3]) { gold.total += Math.floor(Math.pow(deityArray[index][3],1/1.25)); }
		//remove the deity
		deityArray.splice(index,1);
		if (deityArray.length == 0){
			document.getElementById('iconoclasmGroup').style.display = 'none';
		}
		updateOldDeities();
	}
}

/* Enemies */

function summonMob(mobtype){
	//Calls spawnMob() if the player has the correct resources (currently used by Deities of Battle)
	if (piety.total >= 100){
		piety.total -= 100;
		spawnMob(mobtype);
	}
}

function spawnMob(mobtype){
	var num, pop, tot, clt, nus, tos, cls;
	//Creates enemies based on current population
	if (mobtype == 'wolf'){
		//Calculates appropriate number
		num = Math.random();
		pop = (population.current / 50);
		tot = num * pop;
		clt = Math.ceil(tot);
		population.wolves += clt;
		population.wolvesCas += clt;
		//Informs player
        if (clt > 0) { gameLog(prettify(clt) + ' wolves attacked'); }
		document.getElementById('wolfgroup').style.display = 'table-row';
	}
	if(mobtype == 'bandit'){
		num = Math.random();
		pop = ((population.current + population.zombies) / 50);
		tot = num * pop;
		clt = Math.ceil(tot);
		nus = Math.random();
		tos = nus * clt/500;
		cls = Math.floor(tos);
		population.bandits += clt;
		population.banditsCas += clt;
		population.esiege += cls;
        if (cls > 0){
			gameLog(prettify(clt) + ' bandits attacked, with ' + prettify(cls) + ' siege engines');
			document.getElementById('banditgroup').style.display = 'table-row';
			document.getElementById('esiegegroup').style.display = 'table-row';
		} else if (clt > 0){
			gameLog(prettify(clt) + ' bandits attacked');
			document.getElementById('banditgroup').style.display = 'table-row';
		}
	}
	if (mobtype == 'barbarian'){
		num = Math.random();
		pop = ((population.current + population.zombies) / 50);
		tot = num * pop;
		clt = Math.ceil(tot);
		nus = Math.random();
		tos = nus * clt/100;
		cls = Math.floor(tos);
		population.barbarians += clt;
		population.barbariansCas += clt;
		population.esiege += cls;
        if (cls > 0){
			gameLog(prettify(clt) + ' barbarians attacked, with ' + prettify(cls) + ' siege engines');
			document.getElementById('barbariangroup').style.display = 'table-row';
			document.getElementById('esiegegroup').style.display = 'table-row';
		} else if (clt > 0){
			gameLog(prettify(clt) + ' barbarians attacked');
			document.getElementById('barbariangroup').style.display = 'table-row';
		}
	}
	updateMobs(); //updates page with numbers
}

function smite(){
	var num;
	if (population.barbarians > 0){
		if (piety.total >= population.barbarians * 100){
			piety.total -= population.barbarians * 100;
			population.enemiesSlain += population.barbarians;
			population.corpses += population.barbarians;
			gameLog('Struck down ' + population.barbarians + ' barbarians');
			if (upgrades.throne) { throneCount += population.barbarians; }
			if (upgrades.book) { piety.total += population.barbarians * 10; }
			population.barbarians = 0;
			population.barbariansCas = 0;
		} else if (piety.total >= 100){
			num = Math.floor(piety.total/100);
			gameLog('Struck down ' + num + ' barbarians');
			population.barbarians -= num;
			population.barbariansCas -= num;
			population.enemiesSlain += num;
			population.corpses += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	if (population.bandits > 0){
		if (piety.total >= population.bandits * 100){
			piety.total -= population.bandits * 100;
			population.enemiesSlain += population.bandits;
			population.corpses += population.bandits;
			gameLog('Struck down ' + population.bandits + ' bandits');
			if (upgrades.throne) { throneCount += population.bandits; }
			if (upgrades.book) { piety.total += population.bandits * 10; }
			population.bandits = 0;
			population.banditsCas = 0;
		} else if (piety.total >= 100){
			num = Math.floor(piety.total/100);
			gameLog('Struck down ' + num + ' bandits');
			population.bandits -= num;
			population.banditsCas -= num;
			population.enemiesSlain += num;
			population.corpses += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	if (population.wolves > 0){
		if (piety.total >= population.wolves * 100){
			piety.total -= population.wolves * 100;
			population.enemiesSlain += population.wolves;
			population.corpses += population.wolves;
			gameLog('Struck down ' + population.wolves + ' wolves');
			if (upgrades.throne) { throneCount += population.wolves; }
			if (upgrades.book) { piety.total += population.wolves * 10; }
			population.wolves = 0;
			population.wolvesCas = 0;
		} else if (piety.total >= 100){
			num = Math.floor(piety.total/100);
			gameLog('Struck down ' + num + ' wolves');
			population.wolves -= num;
			population.wolvesCas -= num;
			population.enemiesSlain += num;
			population.corpses += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	updateResourceTotals();
	updateMobs();
}

/* War Functions */

function party(member,number){
	//Adds or removes soldiers from army
	if (member == "soldiers"){
		if (number == 'leaveAll'){
			//add all army soldiers back to general pool
			if (population.soldiersParty > 0){
				population.soldiers += population.soldiersParty;
				population.soldiersCas += population.soldiersPartyCas;
				population.soldiersParty = 0;
				population.soldiersPartyCas = 0;
			}
		} else if (number == 'takeAll'){
			//adds all soldiers in general pool to army
			if (population.soldiers > 0){
				population.soldiersParty += population.soldiers;
				population.soldiersPartyCas += population.soldiersCas;
				population.soldiers = 0;
				population.soldiersCas = 0;
			}
		} else {
			//add specific number (can be negative)
			if (number < 0 && population.soldiersParty >= (number * -1)){ //checks that there are sufficient soldiers to remove from army
				population.soldiersParty += number;
				population.soldiersPartyCas += number;
				population.soldiers -= number;
				population.soldiersCas -= number;
			} else if (number > 0 && population.soldiers >= number){ // checks that there are sufficient soldiers to remove from pool
				population.soldiersParty += number;
				population.soldiersPartyCas += number;
				population.soldiers -= number;
				population.soldiersCas -= number;
			} else {
				gameLog('Insufficient Soldiers');
			}
		}
	}
	if (member == "cavalry"){
		if (number == 'leaveAll'){
			//add all army cavalry back to general pool
			if (population.cavalryParty > 0){
				population.cavalry += population.cavalryParty;
				population.cavalryCas += population.cavalryPartyCas;
				population.cavalryParty = 0;
				population.cavalryPartyCas = 0;
			}
		} else if (number == 'takeAll'){
			//adds all cavalry in general pool to army
			if (population.cavalry > 0){
				population.cavalryParty += population.cavalry;
				population.cavalryPartyCas += population.cavalryCas;
				population.cavalry = 0;
				population.cavalryCas = 0;
			}
		} else {
			//add specific number (can be negative)
			if (number < 0 && population.cavalryParty >= (number * -1)){
				population.cavalryParty += number;
				population.cavalryPartyCas += number;
				population.cavalry -= number;
				population.cavalryCas -= number;
			} else if (number > 0 && population.cavalry >= number){
				population.cavalryParty += number;
				population.cavalryPartyCas += number;
				population.cavalry -= number;
				population.cavalryCas -= number;
			} else {
				var cName = 'Cavalry';
				if (upgrades.chivalry) { cName = 'Knights'; }
				gameLog('Insufficient ' + cName);
			}
		}
	}
	if (member == 'siege'){
		if (number == 'max'){
			var built = Math.min(Math.floor(wood.total/200),Math.floor(metal.total/50),Math.floor(leather.total/50));
			population.siege += built;
			wood.total -= 200 * built;
			metal.total -= 50 * built;
			leather.total -= 50 * built;
		} else if (wood.total >= 200 * number && metal.total >= 50 * number && leather.total >= 50 * number){
			population.siege += number;
			wood.total -= 200 * number;
			metal.total -= 50 * number;
			leather.total -= 50 * number;
		} else {
			gameLog("Could not build, insufficient resources.");
		}
		if (!achievements.engineer){
			achievements.engineer = 1;
			updateAchievements();
		}
	}
	updateResourceTotals(); //updates the food/second
	updateParty(); //updates the army display
	updatePartyButtons(); //updates the buttons
	updateJobs(); //updates the general pool
}

function partyCustom(member,multiplier){
	//calls the party function with the custom number from the input
	var custom = document.getElementById('armyCustom').value;
	//Here we must coerce the variable type to be a number for browsers such
	//as Firefox, which don't understand the number type for input elements.
	//If this fails, it should return NaN so we can exclude that later.
	custom = custom - 0;
	//then we make sure it's an integer and at least 0
	custom = Math.floor(custom);
	if (custom < 1) { custom = NaN; }
	//Now we multiply it by the multiplier (so it will either add or remove)
	custom = custom * multiplier;
	//finally, check the above operations haven't returned NaN
	if (!isNaN(custom)){
		party(member,custom);
		document.getElementById('armyCustom').value = custom * multiplier; //reset fractional numbers, check nothing odd happened (needs to be reinverted if the multiplier was negative)
		document.getElementById('armyCustom').style.background = "#fff";
	} else {
		document.getElementById('armyCustom').style.background = "#f99"; //notify user that the input failed
	}
}

function invade(ecivtype){
	//invades a certain type of civilisation based on the button clicked
	var iterations = 0; //used to calculate random number of soldiers
	raiding.raiding = true;
	raiding.last = ecivtype;

	var epop = civSizes.getMaxPop(ecivtype) + 1;
	if (epop <= 0 ) // no max pop; use 2x min pop.
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
	updateParty();
	document.getElementById('raidGroup').style.display = 'none'; //Hides raid buttons until the raid is finished
}
function onInvade(event) { return invade(event.target.dataset.civtype); }

function plunder(){
	//capture land
	var landCaptured = raiding.iterations * (10 + (10 * upgrades.administration));
	//randomise loot
	var plunderFood = Math.round(Math.random() * raiding.iterations * 10),
		plunderWood = Math.round(Math.random() * raiding.iterations * 10),
		plunderStone = Math.round(Math.random() * raiding.iterations * 10),
		plunderSkins = Math.round(Math.random() * raiding.iterations * 10),
		plunderHerbs = Math.round(Math.random() * raiding.iterations * 10),
		plunderOre = Math.round(Math.random() * raiding.iterations * 10),
		plunderLeather = Math.round(Math.random() * raiding.iterations * 10),
		plunderMetal = Math.round(Math.random() * raiding.iterations * 10);

	// create message to notify player
	// Special handling for 'a'/'an' ('empire' is the only one that starts with a vowel)
	var prettyLast = (raiding.last == 'empire') ? 'an ' : 'a ';
	prettyLast += civSizes[civSizes[raiding.last]].name;

	var plunderMessage = "Defeated " + prettyLast + ". Plundered " + prettify(plunderFood) + " food, " + prettify(plunderWood) + " wood, " + prettify(plunderStone) + " stone, " + prettify(plunderSkins) + " skins, " + prettify(plunderHerbs) + " herbs, " + prettify(plunderOre) + " ore, " + prettify(plunderLeather) + " leather, and " + prettify(plunderMetal) + " metal. Captured " + prettify(landCaptured) + " land.";
	//add loot
	land += landCaptured;
	updateBuildingTotals();
	food.total += plunderFood;
	wood.total += plunderWood;
	stone.total += plunderStone;
	skins.total += plunderSkins;
	herbs.total += plunderHerbs;
	ore.total += plunderOre;
	leather.total += plunderLeather;
	metal.total += plunderMetal;
	gameLog(plunderMessage); //notify player
	raiding.raiding = false; //ends the raid state
	raiding.victory = false; //ends the victory state
	document.getElementById('victoryGroup').style.display = 'none';
}

function glory(time){
	if (piety.total >= 1000){ //check it can be bought
		gloryTimer = time; //set timer
		piety.total -= 1000; //decrement resources
		document.getElementById('gloryTimer').innerHTML = gloryTimer; //update timer to player
		document.getElementById('gloryGroup').style.display = 'block';
	}
}

function grace(delta){
	if (piety.total >= graceCost){
		piety.total -= graceCost;
		graceCost = Math.floor(graceCost * 1.2);
		document.getElementById('graceCost').innerHTML = prettify(graceCost);
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
			gameLog('Achievement Unlocked: Loved');
			achievements.loved = 1;
			updateAchievements();
		}
		if (efficiency.happiness <= 0.5 && !achievements.hated){
			gameLog('Achievement Unlocked: Hated');
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
		document.getElementById('startWonder').disabled = true;
		document.getElementById('speedWonderGroup').style.display = 'block';
		wonder.building = true;
		updateWonder();
	}
}

function renameWonder(){
	var n = prompt('Please name your Wonder:',wonder.name);
	wonder.name = n;
	document.getElementById('wonderNameP').innerHTML = wonder.name;
	document.getElementById('wonderNameC').innerHTML = wonder.name;
}

function wonderBonus(material){
	if (material == 'Food') { wonder.food += 1; }
	if (material == 'Wood') { wonder.wood += 1; }
	if (material == 'Stone') { wonder.stone += 1; }
	if (material == 'Skins') { wonder.skins += 1; }
	if (material == 'Herbs') { wonder.herbs += 1; }
	if (material == 'Ore') { wonder.ore += 1; }
	if (material == 'Leather') { wonder.leather += 1; }
	if (material == 'Metal') { wonder.metal += 1; }
	if (material == 'Piety') { wonder.piety += 1; }
	gameLog('You now have a permanent bonus to ' + material + ' production.');
	wonder.array.push([wonder.name,material]);
	wonder.total = Math.max(wonder.food,wonder.wood,wonder.stone,wonder.skins,wonder.herbs,wonder.ore,wonder.leather,wonder.metal,wonder.piety);
	wonder.name = '';
	wonder.progress = 0;
	wonder.building = false;
	updateWonder();
}

function updateWonderLimited(){
	if (food.total < 1){
		document.getElementById('limited').innerHTML = " by low food";
	} else if (wood.total < 1){
		document.getElementById('limited').innerHTML = " by low wood";
	} else if (stone.total < 1){
		document.getElementById('limited').innerHTML = " by low stone";
	} else if (skins.total < 1){
		document.getElementById('limited').innerHTML = " by low skins";
	} else if (herbs.total < 1){
		document.getElementById('limited').innerHTML = " by low herbs";
	} else if (ore.total < 1){
		document.getElementById('limited').innerHTML = " by low ore";
	} else if (leather.total < 1){
		document.getElementById('limited').innerHTML = " by low leather";
	} else if (piety.total < 1){
		document.getElementById('limited').innerHTML = " by low piety";
	} else if (metal.total < 1){
		document.getElementById('limited').innerHTML = " by low metal";
	}
}

/* Trade functions */

function tradeTimer(){
	//first set timer length
	trader.timer = 10;
	//add the upgrades
	if (upgrades.currency) { trader.timer += 5; }
	if (upgrades.commerce) { trader.timer += 5; }
	if (upgrades.stay) { trader.timer += 5; }
	//then set material and requested values
	var random = Math.random();
	if (random < 1/8){
		trader.material = food;
		trader.requested = 5000 * Math.ceil(Math.random() * 20);
	} else if (random < 2/8){
		trader.material = wood;
		trader.requested = 5000 * Math.ceil(Math.random() * 20);
	} else if (random < 3/8){
		trader.material = stone;
		trader.requested = 5000 * Math.ceil(Math.random() * 20);
	} else if (random < 4/8){
		trader.material = skins;
		trader.requested = 500 * Math.ceil(Math.random() * 20);
	} else if (random < 5/8){
		trader.material = herbs;
		trader.requested = 500 * Math.ceil(Math.random() * 20);
	} else if (random < 6/8){
		trader.material = ore;
		trader.requested = 500 * Math.ceil(Math.random() * 20);
	} else if (random < 7/8){
		trader.material = leather;
		trader.requested = 250 * Math.ceil(Math.random() * 20);
	} else {
		trader.material = metal;
		trader.requested = 250 * Math.ceil(Math.random() * 20);
	}
	document.getElementById('tradeContainer').style.display = 'block';
	document.getElementById('tradeType').innerHTML = trader.material.name;
	document.getElementById('tradeRequested').innerHTML = prettify(trader.requested);
}

function trade(){
	//check to see if we can trade
	if (trader.material){
		//check we have enough of the right type of resources to trade
		if (trader.material.total >= trader.requested){
			//subtract resources, add gold
			trader.material.total -= trader.requested;
			gold.total += 1;
			updateResourceTotals();
			gameLog('Traded ' + trader.requested + ' ' + trader.material.name);
			if (!achievements.merchant){
				gameLog('Achievement Unlocked: Merchant');
				achievements.merchant = 1;
				updateAchievements();
			}
		} else {
			gameLog('Not enough resources to trade.');
		}
	}
}

function buy(material){
	if (gold.total >= 1){
		if (material == food || material == wood || material == stone) { material.total += 5000; }
		if (material == skins || material == herbs || material == ore) { material.total += 500; }
		if (material == leather || material == metal) { material.total += 250; }
		gold.total -= 1;
		updateResourceTotals();
	}
}

function speedWonder(){
	if (gold.total >= 100){
		wonder.progress += 1 / (1 * Math.pow(1.5,wonder.total));
		gold.total -= 100;
		updateWonder();
		if (!achievements.rushed){
			gameLog('Achievement Unlocked: Rushed');
			achievements.rushed = 1;
			updateAchievements();
		}
	}
}

/* Settings functions */

function save(savetype){
	var xmlhttp;
	//Create objects and populate them with the variables, these will be stored in cookies
	//Each individual cookie stores only ~4000 characters, therefore split currently across two cookies
	//Save files now also stored in localStorage, cookies relegated to backup
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
		size:size
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
	//Create the cookies
	bake_cookie('civ',saveVar);
	bake_cookie('civ2',saveVar2);
	//set localstorage
	try {
		localStorage.setItem('civ', JSON.stringify(saveVar));
		localStorage.setItem('civ2', JSON.stringify(saveVar2));
	} catch(err) {
		console.log('Cannot access localStorage - browser may be old or storage may be corrupt');
	}
	//Update console for debugging, also the player depending on the type of save (manual/auto)
	console.log('Attempted save');
	if (savetype == 'export'){
		var savestring = '[' + JSON.stringify(saveVar) + ',' + JSON.stringify(saveVar2) + ']';
		var compressed = LZString.compressToBase64(savestring);
		console.log('Compressing Save');
		console.log('Compressed from ' + savestring.length + ' to ' + compressed.length + ' characters');
		document.getElementById('impexpField').value = compressed;
		gameLog('Saved game and exported to base64');
	}
	if ((read_cookie('civ') && read_cookie('civ2')) || (localStorage.getItem('civ') && localStorage.getItem('civ2'))){
		console.log('Savegame exists');
		if (savetype == 'auto'){
			console.log('Autosave');
			gameLog('Autosaved');
		} else if (savetype == 'manual'){
			alert('Game Saved');
			console.log('Manual Save');
			gameLog('Saved game');
		}
	}
	try {
		xmlhttp = new XMLHttpRequest();
		xmlhttp.overrideMimeType('text/plain');
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
		console.log('XMLHttpRequest failed');
	}
}

function toggleAutosave(){
	//Turns autosave on or off. Default on.
	if (autosave == "on"){
		console.log("Autosave toggled to off");
		autosave = "off";
		document.getElementById("toggleAutosave").innerHTML = "Enable Autosave";
	} else {
		console.log("Autosave toggled to on");
		autosave = "on";
		document.getElementById("toggleAutosave").innerHTML = "Disable Autosave";
	}
}

function deleteSave(){
	//Deletes the current savegame by setting the game's cookies to expire in the past.
	var really = confirm('Really delete save?'); //Check the player really wanted to do that.
	if (really){
        document.cookie = ['civ', '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
		document.cookie = ['civ2', '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
		localStorage.removeItem('civ');
		localStorage.removeItem('civ2');
        gameLog('Save Deleted');
	}
}

function renameCiv(){
	//Prompts player, uses result as new civName
	var n = prompt('Please name your civilisation',civName);
	if (n !== null){
		civName = n;
		document.getElementById('civName').innerHTML = civName;
	}
}
function renameRuler(){
	//Prompts player, uses result as rulerName
	var n = prompt('What is your name?',rulerName);
	if (n !== null){
		rulerName = n;
		document.getElementById('rulerName').innerHTML = rulerName;
	}
}
function renameDeity(){
	//Prompts player, uses result as deity.name - called when first getting a deity
	var n = prompt('Who do your people worship?',deity.name);
	if (n !== null){
		deity.name = n;
		updateDeity();
	}
}

function reset(){
	//Resets the game, keeping some values but resetting most back to their initial values.
	var really = confirm('Really reset? You will keep past deities and wonders (and cats)'); //Check player really wanted to do that.
	if (really){
		if (upgrades.deity == 1){
			if (oldDeities){
				//Relegates current deity to the oldDeities table.
				if (deity.type){
					deity.type = ', deity of ' + deity.type;
				}
				var append = oldDeities;
				//Sets oldDeities value
				oldDeities = '<tr id="deity' + deity.seniority + '"><td><strong><span id="deity' + deity.seniority + 'Name">' + deity.name + '</span></strong><span id="deity' + deity.seniority + 'Type" class="deityType">' + deity.type + '</span></td><td>Devotion: <span id="devotion' + deity.seniority + '">' + deity.devotion + '</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + deity.seniority + ')">X</button></td></tr>' + append;
				//document.getElementById('activeDeity').innerHTML = '<tr id="deity' + (deity.seniority + 1) + '"><td><strong><span id="deity' + (deity.seniority + 1) + 'Name">No deity</span></strong><span id="deity' + (deity.seniority + 1) + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + (deity.seniority + 1) + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + (deity.seniority + 1) + ')">X</button></td></tr>';
			} else {
				deityArray.push([deity.seniority,deity.name,deity.type,deity.devotion]);
			}
			document.getElementById('activeDeity').innerHTML = '<tr id="deity' + (deity.seniority + 1) + '"><td><strong><span id="deity' + (deity.seniority + 1) + 'Name">No deity</span></strong><span id="deity' + (deity.seniority + 1) + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + (deity.seniority + 1) + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + (deity.seniority + 1) + ')">X</button></td></tr>';
			deity.seniority += 1;
			document.getElementById('deitySpecialisation').style.display = 'none';
		}
		
		food = {
			name:"food",
			total:0,
			increment:1,
			specialchance:0.1
		};
		wood = {
			name:"wood",
			total:0,
			increment:1,
			specialchance:0.1
		};
		stone = {
			name:"stone",
			total:0,
			increment:1,
			specialchance:0.1
		};
		skins = {
			name:"skins",
			total:0
		};
		herbs= {
			name:"herbs",
			total:0
		};
		ore = {
			name:"ore",
			total:0
		};
		leather = {
			name:"leather",
			total:0
		};
		metal = {
			name:"metal",
			total:0
		};
		piety = {
			name:"piety",
			total:0
		};
		gold = {
			name:"gold",
			total:0
		};

		land = 1000;
		tent = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:2,
				stone:0,
				skins:2,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		whut = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:20,
				stone:0,
				skins:1,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		cottage = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:10,
				stone:30,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		house = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:30,
				stone:70,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		mansion = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:200,
				stone:200,
				skins:0,
				herbs:0,
				ore:0,
				leather:20,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		barn = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:100,
				stone:0,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		woodstock = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:100,
				stone:0,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		stonestock = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:100,
				stone:0,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		tannery = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:30,
				stone:70,
				skins:2,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		smithy = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:30,
				stone:70,
				skins:0,
				herbs:0,
				ore:2,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		apothecary = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:30,
				stone:70,
				skins:0,
				herbs:2,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		temple = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:30,
				stone:120,
				skins:0,
				herbs:10,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		barracks = {
			total:0,
			devotion:0,
			require:{
				food:20,
				wood:60,
				stone:120,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:10,
				piety:0,
				corpses:0
			}
		};
		stable = {
			total:0,
			devotion:0,
			require:{
				food:60,
				wood:60,
				stone:120,
				skins:0,
				herbs:0,
				ore:0,
				leather:10,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		mill = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:100,
				stone:100,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		graveyard = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:50,
				stone:200,
				skins:0,
				herbs:50,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		fortification = {
			total:0,
			devotion:0,
			require:{
				food:0,
				wood:0,
				stone:100,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:0,
				corpses:0
			}
		};
		battleAltar = {
			total:0,
			devotion:1,
			require:{
				food:0,
				wood:0,
				stone:200,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:50,
				piety:200,
				corpses:0
			}
		};
		fieldsAltar = {
			total:0,
			devotion:1,
			require:{
				food:500,
				wood:500,
				stone:200,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:200,
				corpses:0
			}
		};
		underworldAltar = {
			total:0,
			devotion:1,
			require:{
				food:0,
				wood:0,
				stone:200,
				skins:0,
				herbs:0,
				ore:0,
				leather:0,
				metal:0,
				piety:200,
				corpses:1
			}
		};
		catAltar = {
			total:0,
			devotion:1,
			require:{
				food:0,
				wood:0,
				stone:200,
				skins:0,
				herbs:100,
				ore:0,
				leather:0,
				metal:0,
				piety:200,
				corpses:0
			}
		};
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
			name:'',
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
			apothecaries:0,
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
			apothecariesIll:0,
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
			farmers:0.2 + (0.1 * upgrades.blessing),
			pestBonus:0,
			woodcutters:0.5,
			miners:0.2,
			tanners:0.5,
			blacksmiths:0.5,
			apothecaries:0.1,
			clerics:0.05,
			soldiers:0.05,
			cavalry:0.08
		};

		upgrades = {
			domestication:0,
			ploughshares:0,
			irrigation:0,
			skinning:0,
			harvesting:0,
			prospecting:0,
			butchering:0,
			gardening:0,
			extraction:0,
			croprotation:0,
			selectivebreeding:0,
			fertilisers:0,
			masonry:0,
			construction:0,
			architecture:0,
			wheel:0,
			horseback:0,
			tenements:0,
			slums:0,
			granaries:0,
			palisade:0,
			weaponry:0,
			shields:0,
			writing:0,
			administration:0,
			codeoflaws:0,
			mathematics:0,
			aesthetics:0,
			civilservice:0,
			feudalism:0,
			guilds:0,
			serfs:0,
			nationalism:0,
			standard:0,
			currency:0,
			commerce:0,
			deity:0,
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
			devotion:0,
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
		document.getElementById('graceCost').innerHTML = prettify(graceCost);
		walkTotal = 0;
		targetMax = 'thorp';
		//Update page with all new values
		updateResourceTotals();
		updateBuildingTotals();
		updateUpgrades();
		updateDeity();
		updateOldDeities();
		updateDevotion();
		updateTargets();
		updateParty();
		updateWonder();
		//Reset upgrades and other interface elements that might have been unlocked
		document.getElementById('renameDeity').disabled = 'true';
		document.getElementById('raiseDead').disabled = 'true';
		document.getElementById('raiseDead100').disabled = 'true';
		document.getElementById('raiseDeadMax').disabled = 'true';
		document.getElementById('smiteInvaders').disabled = 'true';
		document.getElementById('wickerman').disabled = 'true';
		document.getElementById('pestControl').disabled = 'true';
		document.getElementById('grace').disabled = 'true';
		document.getElementById('walk').disabled = 'true';
		document.getElementById('ceaseWalk').disabled = 'true';
		document.getElementById('lure').disabled = 'true';
		document.getElementById('companion').disabled = 'true';
		document.getElementById('comfort').disabled = 'true';
		document.getElementById('book').disabled = 'true';
		document.getElementById('feast').disabled = 'true';
		document.getElementById('blessing').disabled = 'true';
		document.getElementById('waste').disabled = 'true';
		document.getElementById('riddle').disabled = 'true';
		document.getElementById('throne').disabled = 'true';
		document.getElementById('glory').disabled = 'true';
		document.getElementById('shade').disabled = 'true';
		document.getElementById('battleUpgrades').style.display = 'none';
		document.getElementById('fieldsUpgrades').style.display = 'none';
		document.getElementById('underworldUpgrades').style.display = 'none';
		document.getElementById('catsUpgrades').style.display = 'none';
		document.getElementById('constructionLine').style.display = 'none';
		document.getElementById('architectureLine').style.display = 'none';
		document.getElementById('tenementsLine').style.display = 'none';
		document.getElementById('slumsLine').style.display = 'none';
		document.getElementById('granariesLine').style.display = 'none';
		document.getElementById('palisadeLine').style.display = 'none';
		document.getElementById('writingTech').style.display = 'none';
		document.getElementById('civilserviceLine').style.display = 'none';
		document.getElementById('civilTech').style.display = 'none';
		document.getElementById('specFreq').style.display = 'none';
		document.getElementById('cottageRow').style.display = 'none';
		document.getElementById('houseRow').style.display = 'none';
		document.getElementById('mansionRow').style.display = 'none';
		document.getElementById('tanneryRow').style.display = 'none';
		document.getElementById('smithyRow').style.display = 'none';
		document.getElementById('apothecaryRow').style.display = 'none';
		document.getElementById('templeRow').style.display = 'none';
		document.getElementById('barracksRow').style.display = 'none';
		document.getElementById('stableRow').style.display = 'none';
		document.getElementById('millRow').style.display = 'none';
		document.getElementById('fortificationRow').style.display = 'none';
		document.getElementById('tannergroup').style.display = 'none';
		document.getElementById('blacksmithgroup').style.display = 'none';
		document.getElementById('apothecarygroup').style.display = 'none';
		document.getElementById('clericgroup').style.display = 'none';
		document.getElementById('soldiergroup').style.display = 'none';
		document.getElementById('cavalrygroup').style.display = 'none';
		document.getElementById('conquest').style.display = 'none';
		document.getElementById('basicFarming').style.display = 'none';
		document.getElementById('specialFarming').style.display = 'none';
		document.getElementById('improvedFarming').style.display = 'none';
		document.getElementById('masonryTech').style.display = 'none';
		document.getElementById('battleAltarCost').innerHTML = battleAltar.require.metal;
		document.getElementById('fieldsAltarFoodCost').innerHTML = fieldsAltar.require.food;
		document.getElementById('fieldsAltarWoodCost').innerHTML = fieldsAltar.require.wood;
		document.getElementById('underworldAltarCost').innerHTML = underworldAltar.require.corpses;
		document.getElementById('catAltarCost').innerHTML = catAltar.require.herbs;
		document.getElementById('tradeContainer').style.display = 'none';
		document.getElementById('tradeUpgradeContainer').style.display = 'none';
		document.getElementById('fortCost').innerHTML = fortification.require.stone;
		updateRequirements(mill);
		document.getElementById('startWonder').disabled = false;
		document.getElementById('wonderLine').style.display = 'none';
		document.getElementById('iconoclasmList').innerHTML = '';
		document.getElementById('iconoclasm').disabled = false;
        gameLog('Game Reset'); //Inform player.
	}
}

/* Timed functions */

window.setInterval(function(){
	var i;
	//The whole game runs on a single setInterval clock. Basically this whole list is run every second
	//and should probably be minimised as much as possible.

	//debugging - mark beginning of loop execution
	//var start = new Date().getTime();
	
	//Autosave
	if (autosave == "on") {
		autosaveCounter += 1;
		if (autosaveCounter >= 60){ //Currently autosave is every minute. Might change to 5 mins in future.
			save('auto');
			autosaveCounter = 1;
		}
	}
	
	//Resource-related
	
	var millMod = 1;
	if (population.current > 0 || population.zombies > 0) { millMod = population.current / (population.current + population.zombies); }
	food.total += population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus) * (1 + (wonder.food/10)) * (1 + walkTotal/120) * (1 + mill.total * millMod / 200); //Farmers farm food
	if (upgrades.skinning == 1 && population.farmers > 0){ //and sometimes get skins
		var num_skins = food.specialchance * (food.increment + (upgrades.butchering * population.farmers / 15.0)) * (1 + (wonder.skins/10));
		skins.total += Math.floor(num_skins);
		if (Math.random() < (num_skins - Math.floor(num_skins))) { ++skins.total; }
	}
	wood.total += population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood/10)); //Woodcutters cut wood
	if (upgrades.harvesting == 1 && population.woodcutters > 0){ //and sometimes get herbs
		var num_herbs = wood.specialchance * (wood.increment + (upgrades.gardening * population.woodcutters / 5.0)) * (1 + (wonder.wood/10));
		herbs.total += Math.floor(num_herbs);
		if (Math.random() < (num_herbs - Math.floor(num_herbs))) { ++herbs.total; }
	}
	stone.total += population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone/10)); //Miners mine stone
	if (upgrades.prospecting == 1 && population.miners > 0){ //and sometimes get ore
		var num_ore = stone.specialchance * (stone.increment + (upgrades.extraction * population.miners / 5.0)) * (1 + (wonder.ore/10));
		ore.total += Math.floor(num_ore);
		if (Math.random() < (num_ore - Math.floor(num_ore))) { ++ore.total; }
	}
	food.total -= population.current; //The living population eats food.
	var starve;
	if (food.total < 0) { //and will starve if they don't have enough
		if (upgrades.waste && population.corpses >= (food.total * -1)){ //population eats corpses instead
			population.corpses = Math.floor(population.corpses + food.total);
		} else if (upgrades.waste && population.corpses > 0){ //corpses mitigate starvation
			starve = Math.ceil((population.current - population.corpses)/1000);
			if (starve == 1) { gameLog('A worker starved to death'); }
			if (starve > 1) { gameLog(prettify(starve) + ' workers starved to death'); }
			for (i=0; i<starve; i++){
				jobCull();
			}
			updateJobs();
			population.corpses = 0;
		} else { //they just starve
			starve = Math.ceil(population.current/1000);
			if (starve == 1) { gameLog('A worker starved to death'); }
			if (starve > 1) { gameLog(prettify(starve) + ' workers starved to death'); }
			for (i=0; i<starve; i++){
				jobCull();
			}
			updateJobs();
			mood(-0.01);
		}
		food.total = 0;
		updatePopulation(); //Called because jobCull doesn't. May just change jobCull?
	}
	//Workers convert secondary resources into tertiary resources
	if (ore.total >= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness)){
		metal.total += population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness) * (1 + (wonder.metal/10));
		ore.total -= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness);
	} else if (population.blacksmiths) {
		metal.total += ore.total * (1 + (wonder.metal/10));
		ore.total = 0;
	}
	if (skins.total >= population.tanners * (efficiency.tanners * efficiency.happiness)){
		leather.total += population.tanners * (efficiency.tanners * efficiency.happiness) * (1 + (wonder.leather/10));
		skins.total -= population.tanners * (efficiency.tanners * efficiency.happiness);
	} else if (population.tanners) {
		leather.total += skins.total * (1 + (wonder.leather/10));
		skins.total = 0;
	}

	//Resources occasionally go above their caps.
	//Cull the excess /after/ the blacksmiths and tanners take their inputs.
	if (food.total > 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200)){
		food.total = 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200);
	}
	if (wood.total > 200 + (woodstock.total * 200)){
		wood.total = 200 + (woodstock.total * 200);
	}
	if (stone.total > 200 + (stonestock.total * 200)){
		stone.total = 200 + (stonestock.total * 200);
	}

	//Clerics generate piety
	piety.total += population.clerics * (efficiency.clerics + (efficiency.clerics * upgrades.writing)) * (1 + (upgrades.secrets * (1 - 100/(graveyard.total + 100)))) * efficiency.happiness * (1 + (wonder.piety/10));
	
	//Timers - routines that do not occur every second
	
	//Checks when mobs will attack
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
					spawnMob('barbarian');
				} else if (choose > 0.2){
					spawnMob('bandit');
				} else {
					spawnMob('wolf');
				}
			} else if (population.current + population.zombies >= 1000){
				if (Math.random() > 0.5){
					spawnMob('bandit');
				} else {
					spawnMob('wolf');
				}
			} else {
				spawnMob('wolf');
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
		document.getElementById('gloryTimer').innerHTML = gloryTimer;
		gloryTimer -= 1;
	} else {
		document.getElementById('gloryGroup').style.display = 'none';
	}
	
	//traders occasionally show up
	if (population.current + population.zombies > 0) { tradeCounter += 1; }
	if (population.current + population.zombies > 0 && tradeCounter > (60 * (3 - upgrades.currency - upgrades.commerce))){
		check = Math.random() * (60 * (3 - upgrades.currency - upgrades.commerce));
		if (check < (1 + (0.2 * upgrades.comfort))){
			tradeCounter = 0;
			tradeTimer();
		}
	}
	
	updateResourceTotals(); //This is the point where the page is updated with new resource totals
	
	//Population-related
	var mobCasualties,
		mobCasFloor,
		casualties,
		casFloor;
	var leaving;
	var num,stolen;
	var target;

	//Handling wolf attacks (this is complicated)
	if (population.wolves > 0){
		if (population.soldiers > 0 || population.cavalry > 0){ //FIGHT!
			//handles cavalry
			if (population.cavalry > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
				population.wolvesCas -= (population.cavalry * efficiency.cavalry);
				population.cavalryCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0));
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.wolvesCas < 0){
					population.wolvesCas = 0;
				}
				if (population.cavalryCas < 0){
					population.cavalryCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.wolves - population.wolvesCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.cavalry - population.cavalryCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; } //weirdness with floating point numbers. not sure why this is necessary
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.wolves = Math.ceil(population.wolvesCas);
				population.cavalry = Math.ceil(population.cavalryCas);
			}
			//handles soldiers
			if (population.soldiers > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
				population.wolvesCas -= (population.soldiers * efficiency.soldiers);
				population.soldiersCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0));
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.wolvesCas < 0){
					population.wolvesCas = 0;
				}
				if (population.soldiersCas < 0){
					population.soldiersCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.wolves - population.wolvesCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.soldiers - population.soldiersCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; } //weirdness with floating point numbers. not sure why this is necessary
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.wolves = Math.ceil(population.wolvesCas);
				population.soldiers = Math.ceil(population.soldiersCas);
			}
			//Updates population figures (including total population)
			updatePopulation();
		} else {
			//Check to see if there are workers that the wolves can eat
			if (population.healthy > 0){
				//Choose random worker
				target = randomWorker();
				if (Math.random() > 0.5){ //Wolves will sometimes not disappear after eating someone
					population.wolves -= 1;
					population.wolvesCas -= 1;
				}
				if (population.wolvesCas < 0) { population.wolvesCas = 0; }
				console.log('Wolves ate a ' + target);
                gameLog('Wolves ate a ' + target);
				if (target == "unemployed"){
					population.current -= 1;
					population.unemployed -= 1;
				} else if (target == "farmer"){
					population.current -= 1;
					population.farmers -= 1;
				} else if (target == "woodcutter"){
					population.current -= 1;
					population.woodcutters -= 1;
				} else if (target == "miner"){
					population.current -= 1;
					population.miners -= 1;
				} else if (target == "tanner"){
					population.current -= 1;
					population.tanners -= 1;
				} else if (target == "blacksmith"){
					population.current -= 1;
					population.blacksmiths -= 1;
				} else if (target == "apothecary"){
					population.current -= 1;
					population.apothecaries -= 1;
				} else if (target == "cleric"){
					population.current -= 1;
					population.clerics -= 1;
				} else if (target == "labourer"){
					population.current -= 1;
					population.labourers -= 1;
				} else if (target == "soldier"){
					population.current -= 1;
					population.soldiers -= 1;
					population.soldiersCas -= 1;
					if (population.soldiersCas < 0){
						population.soldiers = 0;
						population.soldiersCas = 0;
					}
				} else if (target == "cavalry"){
					population.current -= 1;
					population.cavalry -= 1;
					population.cavalryCas -= 1;
					if (population.cavalryCas < 0){
						population.cavalry = 0;
						population.cavalryCas = 0;
					}
				}
				updatePopulation();
			} else {
				//wolves will leave
				leaving = Math.ceil(population.wolves * Math.random());
				population.wolves -= leaving;
				population.wolvesCas -= leaving;
				updateMobs();
			}
		}
	}
	if (population.bandits > 0){
		if (population.soldiers > 0 || population.cavalry > 0){//FIGHT!
			//Handles cavalry
			if (population.cavalry > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value
				population.banditsCas -= (population.cavalry * efficiency.cavalry);
				population.cavalryCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0)) * 1.5; //cavalry take 50% more casualties vs infantry
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.banditsCas < 0){
					population.banditsCas = 0;
				}
				if (population.cavalryCas < 0){
					population.cavalryCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.bandits - population.banditsCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.cavalry - population.cavalryCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; }
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.bandits = Math.ceil(population.banditsCas);
				population.cavalry = Math.ceil(population.cavalryCas);
			}
			//Handles infantry
			if (population.soldiers > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value
				population.banditsCas -= (population.soldiers * efficiency.soldiers);
				population.soldiersCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0));
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.banditsCas < 0){
					population.banditsCas = 0;
				}
				if (population.soldiersCas < 0){
					population.soldiersCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.bandits - population.banditsCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.soldiers - population.soldiersCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; }
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.bandits = Math.ceil(population.banditsCas);
				population.soldiers = Math.ceil(population.soldiersCas);
			}
			//Updates population figures (including total population)
			updatePopulation();
		} else {
			//Bandits will steal resources. Select random resource, steal random amount of it.
			num = Math.random();
			stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
			if (num < 1/8){
				if (food.total > 0) { gameLog('Bandits stole food'); }
				if (food.total >= stolen){
					food.total -= stolen;
				} else {
					food.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 2/8){
				if (wood.total > 0) { gameLog('Bandits stole wood'); }
				if (wood.total >= stolen){
					wood.total -= stolen;
				} else {
					wood.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 3/8){
				if (stone.total > 0) { gameLog('Bandits stole stone'); }
				if (stone.total >= stolen){
					stone.total -= stolen;
				} else {
					stone.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 4/8){
				if (skins.total > 0) { gameLog('Bandits stole skins'); }
				if (skins.total >= stolen){
					skins.total -= stolen;
				} else {
					skins.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 5/8){
				if (herbs.total > 0) { gameLog('Bandits stole herbs'); }
				if (herbs.total >= stolen){
					herbs.total -= stolen;
				} else {
					herbs.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 6/8){
				if (ore.total > 0) { gameLog('Bandits stole ore'); }
				if (ore.total >= stolen){
					ore.total -= stolen;
				} else {
					ore.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else if (num < 7/8){
				if (leather.total > 0) { gameLog('Bandits stole leather'); }
				if (leather.total >= stolen){
					leather.total -= stolen;
				} else {
					leather.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			} else {
				if (metal.total > 0) { gameLog('Bandits stole metal'); }
				if (metal.total >= stolen){
					metal.total -= stolen;
				} else {
					metal.total = 0;
					//some will leave
					leaving = Math.ceil(population.bandits * Math.random() * (1/8));
					population.bandits -= leaving;
					population.banditsCas -= leaving;
					updateMobs();
				}
			}
			population.bandits -= 1; //Bandits leave after stealing something.
			population.banditsCas -= 1;
			if (population.banditsCas < 0) { population.banditsCas = 0; }
			updateResourceTotals();
			updatePopulation();
		}
	}
	if (population.barbarians){
		if (population.soldiers > 0 || population.cavalry > 0){//FIGHT!
			//Handles cavalry
			if (population.cavalry > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value
				population.barbariansCas -= (population.cavalry * efficiency.cavalry);
				population.cavalryCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0)) * 1.5; //Cavalry take 50% more casualties vs. infantry
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.barbariansCas < 0){
					population.barbariansCas = 0;
				}
				if (population.cavalryCas < 0){
					population.cavalryCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.barbarians - population.barbariansCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.cavalry - population.cavalryCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; }
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.barbarians = Math.ceil(population.barbariansCas);
				population.cavalry = Math.ceil(population.cavalryCas);
			}
			//Handles infantry
			if (population.soldiers > 0){
				//Calculate each side's casualties inflicted and subtract them from an effective strength value
				population.barbariansCas -= (population.soldiers * efficiency.soldiers);
				population.soldiersCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total/100),0));
				//If this reduces effective strengths below 0, reset it to 0.
				if (population.barbariansCas < 0){
					population.barbariansCas = 0;
				}
				if (population.soldiersCas < 0){
					population.soldiersCas = 0;
				}
				//Calculates the casualties dealt based on difference between actual numbers and new effective strength
				mobCasualties = population.barbarians - population.barbariansCas;
				mobCasFloor = Math.floor(mobCasualties);
				casualties = population.soldiers - population.soldiersCas;
				casFloor = Math.floor(casualties);
				if (!(mobCasFloor > 0)) { mobCasFloor = 0; }
				if (!(casFloor > 0)) { casFloor = 0; }
				//Increments enemies slain, corpses, and piety
				population.enemiesSlain += mobCasFloor;
				if (upgrades.throne) { throneCount += mobCasFloor; }
				population.corpses += (casFloor + mobCasFloor);
				if (upgrades.book) {
					piety.total += (casFloor + mobCasFloor) * 10;
				}
				//Resets the actual numbers based on effective strength
				population.barbarians = Math.ceil(population.barbariansCas);
				population.soldiers = Math.ceil(population.soldiersCas);
			}
			//Updates population figures (including total population)
			updatePopulation();
		} else {
			var havoc = Math.random(); //barbarians do different things
			if (havoc < 0.3){
				//Kill people, see wolves
				if (population.healthy > 0){
					//No honor in killing the sick who will starve anyway
					target = randomWorker(); //Choose random worker
					population.barbarians -= 1; //Barbarians always disappear after killing
					population.barbariansCas -= 1;
					if (population.barbariansCas < 0) { population.barbariansCas = 0; }
					console.log('Barbarians killed a ' + target);
					gameLog('Barbarians killed a ' + target);
					if (target == "unemployed"){
						population.current -= 1;
						population.unemployed -= 1;
					} else if (target == "farmer"){
						population.current -= 1;
						population.farmers -= 1;
					} else if (target == "woodcutter"){
						population.current -= 1;
						population.woodcutters -= 1;
					} else if (target == "miner"){
						population.current -= 1;
						population.miners -= 1;
					} else if (target == "tanner"){
						population.current -= 1;
						population.tanners -= 1;
					} else if (target == "blacksmith"){
						population.current -= 1;
						population.blacksmiths -= 1;
					} else if (target == "apothecary"){
						population.current -= 1;
						population.apothecaries -= 1;
					} else if (target == "cleric"){
						population.current -= 1;
						population.clerics -= 1;
					} else if (target == "labourer"){
						population.current -= 1;
						population.labourers -= 1;
					} else if (target == "soldier"){
						population.current -= 1;
						population.soldiers -= 1;
						population.soldiersCas -= 1;
						if (population.soldiersCas < 0){
							population.soldiers = 0;
							population.soldiersCas = 0;
						}
					} else if (target == "cavalry"){
						population.current -= 1;
						population.cavalry -= 1;
						population.cavalryCas -= 1;
						if (population.cavalryCas < 0){
							population.cavalry = 0;
							population.cavalryCas = 0;
						}
					}
					population.corpses += 1; //Unlike wolves, Barbarians leave corpses behind
					updatePopulation();
				} else {
					leaving = Math.ceil(population.barbarians * Math.random() * (1/3));
					population.barbarians -= leaving;
					population.barbariansCas -= leaving;
					updateMobs();
				}
			} else if (havoc < 0.6){
				//Steal shit, see bandits
				num = Math.random();
				stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
				if (num < 1/8){
					if (food.total > 0) { gameLog('Barbarians stole food'); }
					if (food.total >= stolen){
						food.total -= stolen;
					} else {
						food.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 2/8){
					if (wood.total > 0) { gameLog('Barbarians stole wood'); }
					if (wood.total >= stolen){
						wood.total -= stolen;
					} else {
						wood.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 3/8){
					if (stone.total > 0) { gameLog('Barbarians stole stone'); }
					if (stone.total >= stolen){
						stone.total -= stolen;
					} else {
						stone.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 4/8){
					if (skins.total > 0) { gameLog('Barbarians stole skins'); }
					if (skins.total >= stolen){
						skins.total -= stolen;
					} else {
						skins.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 5/8){
					if (herbs.total > 0) { gameLog('Barbarians stole herbs'); }
					if (herbs.total >= stolen){
						herbs.total -= stolen;
					} else {
						herbs.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 6/8){
					if (ore.total > 0) { gameLog('Barbarians stole ore'); }
					if (ore.total >= stolen){
						ore.total -= stolen;
					} else {
						ore.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 7/8){
					if (leather.total > 0) { gameLog('Barbarians stole leather'); }
					if (leather.total >= stolen){
						leather.total -= stolen;
					} else {
						leather.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else {
					if (metal.total > 0) { gameLog('Barbarians stole metal'); }
					if (metal.total >= stolen){
						metal.total -= stolen;
					} else {
						metal.total = 0;
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				}
				population.barbarians -= 1; //Barbarians leave after stealing something.
				population.barbariansCas -= 1;
				if (population.barbariansCas < 0) { population.barbariansCas = 0; }
				updateResourceTotals();
				updatePopulation();
			} else {
				//Destroy buildings
				num = Math.random(); //Barbarians attempt to destroy random buildings (and leave if they do)
				if (num < 1/16){
					if (tent.total > 0){
						tent.total -= 1;
						gameLog('Barbarians destroyed a tent');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 2/16){
					if (whut.total > 0){
						whut.total -= 1;
						gameLog('Barbarians destroyed a wooden hut');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 3/16){
					if (cottage.total > 0){
						cottage.total -= 1;
						gameLog('Barbarians destroyed a cottage');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 4/16){
					if (house.total > 0){
						house.total -= 1;
						gameLog('Barbarians destroyed a house');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 5/16){
					if (mansion.total > 0){
						mansion.total -= 1;
						gameLog('Barbarians destroyed a mansion');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 6/16){
					if (barn.total > 0){
						barn.total -= 1;
						gameLog('Barbarians destroyed a barn');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 7/16){
					if (woodstock.total > 0){
						woodstock.total -= 1;
						gameLog('Barbarians destroyed a wood stockpile');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 8/16){
					if (stonestock.total > 0){
						stonestock.total -= 1;
						gameLog('Barbarians destroyed a stone stockpile');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 9/16){
					if (tannery.total > 0){
						tannery.total -= 1;
						gameLog('Barbarians destroyed a tannery');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 10/16){
					if (smithy.total > 0){
						smithy.total -= 1;
						gameLog('Barbarians destroyed a smithy');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 11/16){
					if (apothecary.total > 0){
						apothecary.total -= 1;
						gameLog('Barbarians destroyed an apothecary');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 12/16){
					if (temple.total > 0){
						temple.total -= 1;
						gameLog('Barbarians destroyed a temple');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 13/16){
					if (fortification.total > 0){
						fortification.total -= 1;
						gameLog('Barbarians damaged fortifications');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 14/16){
					if (stable.total > 0){
						stable.total -= 1;
						gameLog('Barbarians destroyed a stable');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else if (num < 15/16){
					if (mill.total > 0){
						mill.total -= 1;
						gameLog('Barbarians destroyed a mill');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				} else {
					if (barracks.total > 0){
						barracks.total -= 1;
						gameLog('Barbarians destroyed a barracks');
					} else {
						//some will leave
						leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
						population.barbarians -= leaving;
						population.barbariansCas -= leaving;
						updateMobs();
					}
				}
				population.barbarians -= 1;
				population.barbariansCas -= 1;
				if (population.barbarians < 0) { population.barbarians = 0; }
				if (population.barbariansCas < 0) { population.barbariansCas = 0; }
				updateBuildingTotals();
				updatePopulation();
			}
		}	
	}
	if (population.shades > 0){
		if (population.wolves >= population.shades/4){
			population.wolves -= Math.floor(population.shades/4);
			population.wolvesCas -= population.shades/4;
			population.shades -= Math.floor(population.shades/4);
		} else if (population.wolves > 0){
			population.shades -= Math.floor(population.wolves);
			population.wolves = 0;
			population.wolvesCas = 0;
		}
		if (population.bandits >= population.shades/4){
			population.bandits -= Math.floor(population.shades/4);
			population.banditsCas -= population.shades/4;
			population.shades -= Math.floor(population.shades/4);
		} else if (population.bandits > 0){
			population.shades -= Math.floor(population.bandits);
			population.bandits = 0;
			population.banditsCas = 0;
		}
		if (population.barbarians >= population.shades/4){
			population.barbarians -= Math.floor(population.shades/4);
			population.barbariansCas -= population.shades/4;
			population.shades -= Math.floor(population.shades/4);
		} else if (population.bandits > 0){
			population.shades -= Math.floor(population.barbarians);
			population.barbarians = 0;
			population.barbariansCas = 0;
		}
		population.shades = Math.floor(population.shades * 0.95);
		if (population.shades < 0) { population.shades = 0; }
		updatePopulation();
	}
	var hit;
	var firing;
	if (population.esiege > 0){
		//First check there are enemies there defending them
		if (population.bandits > 0 || population.barbarians > 0){
			if (fortification.total > 0){ //needs to be something to fire at
				firing = Math.ceil(Math.min(population.esiege/2,100)); //At most half or 100 can fire at a time
				for (i = 0; i < firing; i++){
					if (fortification.total > 0){ //still needs to be something to fire at
						hit = Math.random();
						if (hit < 0.1){ //each siege engine has 10% to hit
							fortification.total -= 1;
							gameLog('Enemy siege engine damaged our fortifications');
							updateRequirements(fortification);
						} else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
							population.esiege -= 1;
						}
					}
				}
				updateBuildingTotals();
			}
		} else if (population.soldiers > 0 || population.cavalry > 0) {
			//the siege engines are undefended
			if (upgrades.mathematics){ //Can we use them?
				gameLog('Captured ' + prettify(population.esiege) + ' enemy siege engines.');
				population.siege += population.esiege; //capture them
				updateParty(); //show them in conquest pane
			} else {
				//we can't use them, therefore simply destroy them
				gameLog('Destroyed ' + prettify(population.esiege) + ' enemy siege engines.');
			}
			population.esiege = 0;
		}
		updateMobs();
	}

	if (raiding.raiding){ //handles the raiding subroutine
		if (population.soldiersParty > 0 || population.cavalryParty || raiding.victory){ //technically you can win, then remove all your soldiers
			if (population.esoldiers > 0){
				/* FIGHT! */
				//Handles cavalry
				if (population.cavalryParty > 0){
					//Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
					population.esoldiersCas -= (population.cavalryParty * efficiency.cavalry) * Math.max(1 - population.eforts/100,0);
					population.cavalryPartyCas -= (population.esoldiers * 0.05 * 1.5); //Cavalry takes 50% more casualties vs. infantry
					//If this reduces effective strengths below 0, reset it to 0.
					if (population.esoldiersCas < 0){
						population.esoldiersCas = 0;
					}
					if (population.cavalryPartyCas < 0){
						population.cavalryPartyCas = 0;
					}
					//Calculates the casualties dealt based on difference between actual numbers and new effective strength
					mobCasualties = population.esoldiers - population.esoldiersCas;
					mobCasFloor = Math.floor(mobCasualties);
					casualties = population.cavalryParty - population.cavalryPartyCas;
					casFloor = Math.floor(casualties);
					if (!(mobCasFloor > 0)) { mobCasFloor = 0; } //weirdness with floating point numbers. not sure why this is necessary
					if (!(casFloor > 0)) { casFloor = 0; }
					//Increments enemies slain, corpses, and piety
					population.enemiesSlain += mobCasFloor;
					if (upgrades.throne) { throneCount += mobCasFloor; }
					population.corpses += (casFloor + mobCasFloor);
					updatePopulation();
					if (upgrades.book) {
						piety.total += (casFloor + mobCasFloor) * 10;
						updateResourceTotals();
					}
					//Resets the actual numbers based on effective strength
					population.esoldiers = Math.ceil(population.esoldiersCas);
					population.cavalryParty = Math.ceil(population.cavalryPartyCas);
				}
				//Handles infantry
				if (population.soldiersParty > 0){
					//Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
					population.esoldiersCas -= (population.soldiersParty * efficiency.soldiers) * Math.max(1 - population.eforts/100,0);
					population.soldiersPartyCas -= (population.esoldiers * 0.05);
					//If this reduces effective strengths below 0, reset it to 0.
					if (population.esoldiersCas < 0){
						population.esoldiersCas = 0;
					}
					if (population.soldiersPartyCas < 0){
						population.soldiersPartyCas = 0;
					}
					//Calculates the casualties dealt based on difference between actual numbers and new effective strength
					mobCasualties = population.esoldiers - population.esoldiersCas;
					mobCasFloor = Math.floor(mobCasualties);
					casualties = population.soldiersParty - population.soldiersPartyCas;
					casFloor = Math.floor(casualties);
					if (!(mobCasFloor > 0)) { mobCasFloor = 0; } //weirdness with floating point numbers. not sure why this is necessary
					if (!(casFloor > 0)) { casFloor = 0; }
					//Increments enemies slain, corpses, and piety
					population.enemiesSlain += mobCasFloor;
					if (upgrades.throne) { throneCount += mobCasFloor; }
					population.corpses += (casFloor + mobCasFloor);
					updatePopulation();
					if (upgrades.book) {
						piety.total += (casFloor + mobCasFloor) * 10;
						updateResourceTotals();
					}
					//Resets the actual numbers based on effective strength
					population.esoldiers = Math.ceil(population.esoldiersCas);
					population.soldiersParty = Math.ceil(population.soldiersPartyCas);
				}
				//Handles siege engines
				if (population.siege > 0 && population.eforts > 0){ //need to be siege weapons and something to fire at
					firing = Math.ceil(Math.min(population.siege/2,population.eforts*2));
					if (firing > population.siege) { firing = population.siege; } //should never happen
					for (i = 0; i < firing; i++){
						if (population.eforts > 0){ //still needs to be something to fire at
							hit = Math.random();
							if (hit < 0.1){ //each siege engine has 10% to hit
								population.eforts -= 1;
							} else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
								population.siege -= 1;
							}
						}
					}
				}
				
				/* END FIGHT! */
				
				//checks victory conditions (needed here because of the order of tests)
				if (population.esoldiers <= 0){
					population.esoldiers = 0; //ensure esoldiers is 0
					population.esoldiersCas = 0; //ensure esoldiers is 0
					population.eforts = 0; //ensure eforts is 0
					gameLog('Raid victorious!'); //notify player
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

					updateTargets(); //update the new target
				}
				updateParty(); //display new totals for army soldiers and enemy soldiers
			} else if (raiding.victory){
				//handles the victory outcome
				document.getElementById('victoryGroup').style.display = 'block';
			} else {
				//victory outcome has been handled, end raid
				raiding.raiding = false;
				raiding.iterations = 0;
			}
		} else {
			gameLog('Raid defeated');
			population.esoldiers = 0;
			population.esoldiersCas = 0;
			population.eforts = 0;
			population.siege = 0;
			updateParty();
			raiding.raiding = false;
			raiding.iterations = 0;
		}
	} else {
		document.getElementById('raidGroup').style.display = 'block';
	}
	
	if (population.corpses > 0 && population.graves > 0){
		//Clerics will bury corpses if there are graves to fill and corpses lying around
		for (i=0;i<population.clerics;i++){
			if (population.corpses > 0 && population.graves > 0){
				population.corpses -= 1;
				population.graves -= 1;
			}
		}
		updatePopulation();
	}
	if (population.totalSick > 0 && population.apothecaries + (population.cats * upgrades.companion) > 0){
		//Apothecaries curing sick people
		for (i=0;i<population.apothecaries + (population.cats * upgrades.companion);i++){
			if (herbs.total > 0){
				//Increment efficiency counter
				cureCounter += (efficiency.apothecaries * efficiency.happiness);
				while (cureCounter >= 1 && herbs.total >= 1){ //OH GOD WHY AM I USING THIS
					//Decrement counter
					//This is doubly important because of the While loop
					cureCounter -= 1;
					//Select a sick worker to cure, with certain priorities
					if (population.apothecariesIll > 0){ //Don't all get sick
						population.apothecariesIll -= 1;
						population.apothecaries += 1;
						herbs.total -= 1;
					} else if (population.farmersIll > 0){ //Don't starve
						population.farmersIll -= 1;
						population.farmers += 1;
						herbs.total -= 1;
					} else if (population.soldiersIll > 0){ //Don't get attacked
						population.soldiersIll -= 1;
						population.soldiers += 1;
						population.soldiersCas += 1;
						herbs.total -= 1;
					} else if (population.cavalryIll > 0){ //Don't get attacked
						population.cavalryIll -= 1;
						population.cavalry += 1;
						population.cavalryCas += 1;
						herbs.total -= 1;
					} else if (population.clericsIll > 0){ //Bury corpses to make this problem go away
						population.clericsIll -= 1;
						population.clerics += 1;
						herbs.total -= 1;
					} else if (population.labourersIll > 0){
						population.labourersIll -= 1;
						population.labourers += 1;
						herbs.total -= 1;
					} else if (population.woodcuttersIll > 0){
						population.woodcuttersIll -= 1;
						population.woodcutters += 1;
						herbs.total -= 1;
					} else if (population.minersIll > 0){
						population.minersIll -= 1;
						population.miners += 1;
						herbs.total -= 1;
					} else if (population.tannersIll > 0){
						population.tannersIll -= 1;
						population.tanners += 1;
						herbs.total -= 1;
					} else if (population.blacksmithsIll > 0){
						population.blacksmithsIll -= 1;
						population.blacksmiths += 1;
						herbs.total -= 1;
					} else if (population.unemployedIll > 0){
						population.unemployedIll -= 1;
						population.unemployed += 1;
						herbs.total -= 1;
					}
				}
			}
		}
		updatePopulation();
	}
	if (population.corpses > 0){
		//Corpses lying around will occasionally make people sick.
		var sickChance = Math.random() * (50 + (upgrades.feast * 50));
		if (sickChance < 1){
			var sickNum = Math.floor(population.current/100 * Math.random());
			if (sickNum > 0) { plague(sickNum); }
		}
	}
	
	if (throneCount >= 100){
		//If sufficient enemies have been slain, build new temples for free
		temple.total += Math.floor(throneCount/100);
		throneCount = 0;
		updateBuildingTotals();
	}
	
	if (graceCost > 1000) {
		graceCost -= 1;
		graceCost = Math.floor(graceCost);
		document.getElementById('graceCost').innerHTML = prettify(graceCost);
	}
	
	if (walkTotal > 0){
		if (population.healthy > 0){
			for (i=0;i<walkTotal;i++){
				target = randomWorker();
				if (target == "unemployed"){
					population.current -= 1;
					population.unemployed -= 1;
				} else if (target == "farmer"){
					population.current -= 1;
					population.farmers -= 1;
				} else if (target == "woodcutter"){
					population.current -= 1;
					population.woodcutters -= 1;
				} else if (target == "miner"){
					population.current -= 1;
					population.miners -= 1;
				} else if (target == "tanner"){
					population.current -= 1;
					population.tanners -= 1;
				} else if (target == "blacksmith"){
					population.current -= 1;
					population.blacksmiths -= 1;
				} else if (target == "apothecary"){
					population.current -= 1;
					population.apothecaries -= 1;
				} else if (target == "cleric"){
					population.current -= 1;
					population.clerics -= 1;
				} else if (target == "labourer"){
					population.current -= 1;
					population.labourers -= 1;
				} else if (target == "soldier"){
					population.current -= 1;
					population.soldiers -= 1;
					population.soldiersCas -= 1;
					if (population.soldiersCas < 0){
						population.soldiers = 0;
						population.soldiersCas = 0;
					}
				} else if (target == "cavalry"){
					population.current -= 1;
					population.cavalry -= 1;
					population.cavalryCas -= 1;
					if (population.cavalryCas < 0){
						population.cavalry = 0;
						population.cavalryCas = 0;
					}
				}
			}
			updatePopulation();
		} else {
			walkTotal = 0;
			document.getElementById('ceaseWalk').disabled = true;
		}
	}
	
	if (wonder.building){
		if (wonder.progress >= 100){
			//Wonder is finished! First, send workers home
			population.unemployed += population.labourers;
			population.unemployedIll += population.labourersIll;
			population.labourers = 0;
			population.labourersIll = 0;
			updatePopulation();
			//hide limited notice
			document.getElementById('lowResources').style.display = 'none';
			//then set wonder.completed so things will be updated appropriately
			wonder.completed = true;
			//check to see if neverclick was achieved
			if (!achievements.neverclick && resourceClicks <= 22){
				achievements.neverclick = 1;
				gameLog('Achievement Unlocked: Neverclick!');
				updateAchievements();
			}
		} else {
			//we're still building
			//first, check for labourers
			if (population.labourers > 0){
				//then check we have enough resources
				if (food.total >= population.labourers && stone.total >= population.labourers && wood.total >= population.labourers && skins.total >= population.labourers && herbs.total >= population.labourers && ore.total >= population.labourers && metal.total >= population.labourers && leather.total >= population.labourers && piety.total >= population.labourers){
					//remove resources
					food.total -= population.labourers;
					wood.total -= population.labourers;
					stone.total -= population.labourers;
					skins.total -= population.labourers;
					herbs.total -= population.labourers;
					ore.total -= population.labourers;
					leather.total -= population.labourers;
					metal.total -= population.labourers;
					piety.total -= population.labourers;
					//increase progress
					wonder.progress += population.labourers / (1000000 * Math.pow(1.5,wonder.total));
					//hide limited notice
					document.getElementById('lowResources').style.display = 'none';
				} else if (food.total >= 1 && stone.total >= 1 && wood.total >= 1 && skins.total >= 1 && herbs.total >= 1 && ore.total >= 1 && metal.total >= 1 && leather.total >= 1 && piety.total >= 1){
					//or at least some resources
					var number = Math.min(food.total,wood.total,stone.total,skins.total,herbs.total,ore.total,leather.total,metal.total,piety.total);
					//remove resources
					food.total -= number;
					wood.total -= number;
					stone.total -= number;
					skins.total -= number;
					herbs.total -= number;
					ore.total -= number;
					leather.total -= number;
					metal.total -= number;
					piety.total -= number;
					//increase progress
					wonder.progress += number / (1000000 * Math.pow(1.5,wonder.total));
					//show limited notice
					document.getElementById('lowResources').style.display = 'block';
					updateWonderLimited();
				} else {
					//we don't have enough resources to do any work
					//show limited notice
					document.getElementById('lowResources').style.display = 'block';
					updateWonderLimited();
				}
			} else {
				//we're not working on the wonder, so hide limited notice
				document.getElementById('lowResources').style.display = 'none';
			}
		}
		updateWonder();
	}
	
	//Trader stuff
	
	if (trader.timer > 0){
		if (trader.timer > 1){
			trader.timer -= 1;
		} else {
			document.getElementById('tradeContainer').style.display = 'none';
			trader.timer -= 1;
		}
	}
	
	updateUpgrades();
	updateBuildingButtons();
	updateJobs();
	updatePartyButtons();
	updateSpawnButtons();
	updateReset();
	
	//Debugging - mark end of main loop and calculate delta in milliseconds
	//var end = new Date().getTime();
	//var time = end - start;
	//console.log('Main loop execution time: ' + time + 'ms');
	
}, 1000); //updates once per second (1000 milliseconds)

/* UI functions */

function paneSelect(name){
	//Called when user switches between the various panes on the left hand side of the interface
	if (name == 'buildings'){
		document.getElementById("buildingsPane").style.display = "block";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector selected";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'upgrades'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "block";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector selected";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'deity'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "block";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector selected";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'conquest'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "block";
		document.getElementById("tradePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector selected";
		document.getElementById("selectTrade").className = "paneSelector";
	}
	if (name == 'trade'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("deityPane").style.display = "none";
		document.getElementById("conquestPane").style.display = "none";
		document.getElementById("tradePane").style.display = "block";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectDeity").className = "paneSelector";
		document.getElementById("selectConquest").className = "paneSelector";
		document.getElementById("selectTrade").className = "paneSelector selected";
	}
}

function toggleCustomIncrements(){
	var i;
	var elems;
	if(customIncrements){
		customIncrements = false;
		document.getElementById('toggleCustomIncrements').innerHTML = "Enable Custom Increments";
		document.getElementById('customJobIncrement').style.display = "none";
		document.getElementById('customBuildIncrement').style.display = "none";
		document.getElementById('customArmyIncrement').style.display = "none";
		document.getElementById('customSpawnIncrement').style.display = "none";
		document.getElementById('spawn1group').style.display = "block";
		if (population.current + population.zombies >= 10) {
			document.getElementById('spawn10').style.display="block";
			elems = document.getElementsByClassName('job10');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
		if (population.current + population.zombies >= 100) {
			document.getElementById('spawn100').style.display="block";
			elems = document.getElementsByClassName('job100');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
			elems = document.getElementsByClassName('buildingten');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
		if (population.current + population.zombies >= 1000) {
			document.getElementById('spawn1000').style.display="block";
			elems = document.getElementsByClassName('buildinghundred');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
		if (population.current + population.zombies >= 10000) {
			elems = document.getElementsByClassName('buildingthousand');
			for(i = 0; i < elems.length; i++) {
				elems[i].style.display = 'table-cell';
			}
		}
		elems = document.getElementsByClassName('jobCustom');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('buildCustom');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
	} else {
		customIncrements = true;
		document.getElementById('toggleCustomIncrements').innerHTML = "Disable Custom Increments";
		document.getElementById('customJobIncrement').style.display = "table-row";
		document.getElementById('customArmyIncrement').style.display = "table-row";
		document.getElementById('customBuildIncrement').style.display = "block";
		document.getElementById('customSpawnIncrement').style.display = "block";
		document.getElementById('spawn1group').style.display="none";
		document.getElementById('spawn10').style.display="none";
		document.getElementById('spawn100').style.display="none";
		document.getElementById('spawn1000').style.display="none";
		elems = document.getElementsByClassName('job10');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('job100');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('buildingten');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('buildinghundred');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('buildingthousand');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'none';
		}
		elems = document.getElementsByClassName('jobCustom');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'table-cell';
		}
		elems = document.getElementsByClassName('buildCustom');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.display = 'table-cell';
		}
	}
}

function toggleNotes(){
	//toggles the display of the .notes class
	var i;
	var elems = document.getElementsByClassName('note');
	for(i = 0; i < elems.length; i++) {
		if (elems[i].style.display == 'none'){
			elems[i].style.display = 'inline';
		} else {
			elems[i].style.display = 'none';
		}
	}
	//then toggles the button itself
	if (document.getElementById('toggleNotes').innerHTML == 'Disable Notes'){
		document.getElementById('toggleNotes').innerHTML = 'Enable Notes';
	} else {
		document.getElementById('toggleNotes').innerHTML = 'Disable Notes';
	}
}

function impExp(){
	if (document.getElementById('impexp').style.display == 'block'){
		document.getElementById('impexp').style.display = 'none';
		document.getElementById('impexpField').value = '';
	} else {
		document.getElementById('impexp').style.display = 'block';
	}
}

function versionAlert(){
	console.log('New Version Available');
	document.getElementById('versionAlert').style.display = 'inline';
}

function text(scale){
	if (scale > 0){
		size += 0.1 * scale;
		document.getElementById('smallerText').disabled = false;
	} else {
		if (size > 0.7){
			size += 0.1 * scale;
			if (size <= 0.7) { document.getElementById('smallerText').disabled = true; }
		}
	}
	body.style.fontSize = size + "em";
}

function textShadow(){
	if (body.style.textShadow != "none"){
		body.style.textShadow = "none";
		document.getElementById('textShadow').innerHTML = 'Enable Text Shadow';
	} else {
		body.style.textShadow = "3px 0 0 #fff, -3px 0 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff";
		document.getElementById('textShadow').innerHTML = 'Disable Text Shadow';
	}
}

function iconToggle(){
	//does nothing yet, will probably toggle display for "icon" and "word" classes as that's probably the simplest way to do this
	if (usingWords){
		usingWords = false;
		document.getElementById('iconToggle').innerHTML = 'Use Words';
	} else {
		usingWords = true;
		document.getElementById('iconToggle').innerHTML = 'Use Icons';
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
	var action = delimiters ? 'Disable' : 'Enable';
	document.getElementById('toggleDelimiters').innerHTML = action + ' Delimiters';

	updateBuildingTotals();
}

function toggleWorksafe(){
	var i;
	var elems;
	if (body.style.backgroundImage == 'none'){
		worksafe = false;
		body.style.backgroundImage = 'url("images/constable.jpg")';
		elems = document.getElementsByClassName('icon');
		if (!usingWords){
			for(i = 0; i < elems.length; i++) {
				elems[i].style.visibility = 'visible';
			}
		}
	} else {
		worksafe = true;
		body.style.backgroundImage = 'none';
		elems = document.getElementsByClassName('icon');
		if (!usingWords){
			for(i = 0; i < elems.length; i++) {
				elems[i].style.visibility = 'hidden';
			}
		}
	}
}


/* Debug functions */

function gameLog(message){
	//Not strictly a debug function so much as it is letting the user know when something happens without needing to watch the console.
	var time = '0.00';
	//get the current date, extract the current time in HH.MM format
   	var d = new Date();
	if (d.getMinutes() < 10){
		time = d.getHours() + ".0" + d.getMinutes();
	} else {
		time = d.getHours() + "." + d.getMinutes();
	}
	//Check to see if the last message was the same as this one, if so just increment the (xNumber) value
	if (document.getElementById('logL').innerHTML === message){
		logRepeat += 1;
		document.getElementById('log0').innerHTML = '<td id="logT">' + time + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
	} else {
		//Reset the (xNumber) value
		logRepeat = 1;
		//Go through all the logs in order, moving them down one and successively overwriting them.
		//Bottom five elements temporarily removed, may be readded later.
		/*document.getElementById('log9').innerHTML = document.getElementById('log8').innerHTML;
		document.getElementById('log8').innerHTML = document.getElementById('log7').innerHTML;
		document.getElementById('log7').innerHTML = document.getElementById('log6').innerHTML;
		document.getElementById('log6').innerHTML = document.getElementById('log5').innerHTML;
		document.getElementById('log5').innerHTML = document.getElementById('log4').innerHTML;*/
		document.getElementById('log4').innerHTML = document.getElementById('log3').innerHTML;
		document.getElementById('log3').innerHTML = document.getElementById('log2').innerHTML;
		document.getElementById('log2').innerHTML = document.getElementById('log1').innerHTML;
		//Since ids need to be unique, log1 strips the ids from the log0 elements when copying the contents.
		document.getElementById('log1').innerHTML = '<td>' + document.getElementById('logT').innerHTML + '</td><td>' + document.getElementById('logL').innerHTML + '</td><td>' + document.getElementById('logR').innerHTML + '</td>';
		//creates new contents with new time, message, and x1
		document.getElementById('log0').innerHTML = '<td id="logT">' + time + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
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
	updatePopulation();
	updateUpgrades();
	updateBuildingTotals();
}

