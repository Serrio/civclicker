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
 * author's website, you can find a copy at <http://dhmholley.co.uk/gpl.txt>). 
 * If not, see <http://www.gnu.org/licenses/>.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var version = 19;
var versionData = {
	major:  1,
	minor:  1,
	sub:   20,
	mod:   'alpha'
};
var logRepeat = 1;
console.log('running');

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

// Initialise Data
var civName = "Woodstock",
rulerName = 'Orteil',
food = {
	id:'food',
	name:'food',
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
},
wood = {
	id:'wood',
	name:'wood',
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
},
stone = {
	id:'stone',
	name:'stone',
	total:0,
	net:0,
	increment:1,
	specialchance:0.1
},
skins = {
	id:'skins',
	name:'skins',
	total:0
},
herbs = {
	id:'herbs',
	name:'herbs',
	total:0
},
ore = {
	id:'ore',
	name:'ore',
	total:0
},
leather = {
	id:'leather',
	name:'leather',
	total:0
},
metal = {
	id:'metal',
	name:'metal',
	total:0
},
piety = {
	id:'piety',
	name:'piety',
	total:0
},
gold = {
	id:'gold',
	name:'gold',
	total:0
},
corpses = {
	id:'corpses',
	name:'corpses',
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
	require:{
		stone:100
	},
	effectText:"helps protect against attack"
};

// Get an object's requirements in text form.
// Pass it a cost object.
// DOES NOT WORK for nonlinear building cost buildings!
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

// Returns how many of this item the player can afford.
// DOES NOT WORK for nonlinear building cost buildings!
function canAfford(costObj)
{
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

var battleAltar = {
	id:"battleAltar",
	name:"battle altar",
	plural:"battle altars",
	total:0,
	devotion:1,
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
	name:'',
	building:false,
	completed:false,
	progress:0
},
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
},
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

// Start of init program code

// Interface initialization code


// Pass this the building definition object.
// Also pass 'true' to only generate the x1 button (for mills and fortifications)
// Or pass nothing, to create a blank row.
function getBuildingRowText(buildingObj, onlyOnes)
{
	if (buildingObj===null || buildingObj===undefined) { return "<tr><td colspan=\"8\"/>&nbsp;</tr>"; }

	var bldId = buildingObj.id;
	var bldName = buildingObj.name;
    var s = "<tr id=\""+bldId+"Row\">";
	// Note that updateBuildingRow() relies on the <tr>'s children being in this particular layout.
	s += "<td><button class=\"build\" onmousedown=\"createBuilding("+bldId+",1)\">Build "+bldName+"</button></td>";
	if (onlyOnes===undefined || onlyOnes !== true) {
	s += "<td class=\"buildingten\"><button class=\"x10\" onmousedown=\"createBuilding("+bldId+",10)\">x10</button></td>";
	s += "<td class=\"buildinghundred\"><button class=\"x100\" onmousedown=\"createBuilding("+bldId+",100)\">x100</button></td>";
	s += "<td class=\"buildingthousand\"><button class=\"x1000\" onmousedown=\"createBuilding("+bldId+",1000)\">x1k</button></td>";
	s += "<td class=\"buildCustom\"><button onmousedown=\"buildCustom("+bldId+")\">+Custom</button></td>";
	}
	else {
	s += "<td class=\"buildingten\"></td><td class=\"buildinghundred\"></td>" +
	     "<td class=\"buildingthousand\"></td><td class=\"buildCustom\"></td>";
	}
	s += "<td class=\"buildingnames\">"+buildingObj.plural+": </td>";
	s += "<td class=\"number\"><span data-action=\"display\" data-target=\""+bldId+"\">0</span></td>";
	s += "<td><span id=\""+bldId+"Cost\"class=\"cost\">"+getReqText(buildingObj.require)+"</span><span class=\"note\">: "+buildingObj.effectText+"</span></td>";
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

addBuildingRows();


//Prompt player for names
if (!read_cookie('civ') && !localStorage.getItem('civ')){
	renameCiv();
	renameRuler();
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
		var msg;
		try {
			string1 = localStorage.getItem('civ');
			string2 = localStorage.getItem('civ2');
		} catch(err) {
			if (err instanceof SecurityError)
				{ msg = 'Browser security settings blocked access to local storage.'; }
			else 
				{ msg = 'Cannot access localStorage - browser may not support localStorage, or storage may be corrupt'; }
			console.log(msg);
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
	
	// BACKWARD COMPATIBILITY SECTION //////////////////
	// population.corpses moved to corpses.total (v1.1.13)
	if (!isValid(loadVar.corpses)) { loadVar.corpses = {}; }
	if (isValid(loadVar.population.corpses)) { 
		if (!isValid(loadVar.population.corpses)) { 
			loadVar.corpses.total = loadVar.population.corpses; 
		}
		loadVar.population.corpses = undefined; 
	}
	// population.apothecaries moved to population.healers (v1.1.17)
	if (isValid(loadVar.population.apothecaries)) { 
		if (!isValid(loadVar.population.apothecaries)) { 
			loadVar.population.healers = loadVar.population.apothecaries; 
		}
		loadVar.population.apothecaries = undefined; 
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
	piety = mergeObj(piety, loadVar.piety);
	gold = mergeObj(gold, loadVar.gold);
	corpses = mergeObj(corpses, loadVar.corpses);
	if (isValid(loadVar.gold)){
		gold = mergeObj(gold, loadVar.gold);
	}
	corpses = mergeObj(corpses, loadVar.corpses);
	if (isValid(loadVar2.wonder)){
		wonder = mergeObj(wonder, loadVar2.wonder);
	}
	land =mergeObj(land, loadVar2.land);
	tent = mergeObj(tent, loadVar2.tent);
	whut = mergeObj(whut, loadVar2.whut);
	cottage =mergeObj(cottage, loadVar2.cottage);
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
			document.getElementById('activeDeity').innerHTML = '<tr id="deity' + deity.seniority + '"><td><strong><span id="deity' + deity.seniority + 'Name">No deity</span></strong><span id="deity' + deity.seniority + 'Type" class="deityType"></span></td><td>Devotion: <span id="devotion' + deity.seniority + '">0</span></td><td class="removeDeity"><button class="removeDeity" onclick="removeDeity(deity' + deity.seniority + ')">X</button></td></tr>';
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
	document.getElementById('civName').innerHTML = civName;
	document.getElementById('rulerName').innerHTML = rulerName;
	document.getElementById('wonderNameP').innerHTML = wonder.name;
	document.getElementById('wonderNameC').innerHTML = wonder.name;
	document.getElementById('startWonder').disabled = (wonder.completed || wonder.building);
		
	//Upgrade-related checks
	efficiency.farmers = 0.2 + (0.1 * upgrades.domestication) + (0.1 * upgrades.ploughshares) + (0.1 * upgrades.irrigation) + (0.1 * upgrades.croprotation) + (0.1 * upgrades.selectivebreeding) + (0.1 * upgrades.fertilisers) + (0.1 * upgrades.blessing);
	efficiency.soldiers = 0.05 + (0.01 * upgrades.riddle) + (0.01 * upgrades.weaponry) + (0.01 * upgrades.shields);
	efficiency.cavalry = 0.08 + (0.01 * upgrades.riddle) + (0.01 * upgrades.weaponry) + (0.01 * upgrades.shields);
}

load('localStorage');//immediately attempts to load

body.style.fontSize = size + "em";
if (!worksafe){
	body.classList.add("hasBackground");
} else {
	body.classList.remove("hasBackground");
	if (!usingWords){
		var elems = document.getElementsByClassName('icon');
		var i;
		for(i = 0; i < elems.length; i++) {
			elems[i].style.visibility = 'hidden';
		}
	}
}

// Update functions. Called by other routines in order to update the interface.
//xxx Maybe add a function here to look in various locations for vars, so it
//doesn't need multiple action types?
function updateResourceTotals(){
	var i,displayElems,elem,val;

	// Scan the HTML document for elements with a 'data-action' element of
	// 'display'.  The 'data-target' of such elements is presumed to contain
	// the global variable name to be displayed as the element's content.
	//xxx This should probably require data-target too.
	displayElems=document.querySelectorAll("[data-action='display']");
	for (i=0;i<displayElems.length;++i)
	{
		elem = displayElems[i];
		elem.innerHTML = prettify(Math.floor(window[dataset(elem,'target')].total));
	}

	// Update net production values for primary resources.  Same as the above,
	// but look for 'data-action' == 'displayNet'.
	displayElems=document.querySelectorAll("[data-action='displayNet']");
	for (i=0;i<displayElems.length;++i)
	{
		elem = displayElems[i];
		val = window[dataset(elem,'target')].net.toFixed(1);
		elem.innerHTML = prettify(val);
		// Colourise net production values.
		if      (val < 0) { elem.style.color='#f00'; }
		else if (val > 0) { elem.style.color='#0b0'; }
		else              { elem.style.color='#000'; }
	}

	if (Math.round(gold.total) > 0){
		setElemDisplay(document.getElementById('goldRow'),true);
		if (!upgrades.trade) { document.getElementById('tradeUpgrade').disabled = false; }
	}

	//Update page with building numbers, also stockpile limits.
	document.getElementById('maxfood').innerHTML = prettify(200 + (200 * (barn.total + (barn.total * upgrades.granaries))));
	document.getElementById('maxwood').innerHTML = prettify(200 + (200 * woodstock.total));
	document.getElementById('maxstone').innerHTML = prettify(200 + (200 * stonestock.total));

	//Update land values
	totalBuildings = tent.total + whut.total + cottage.total + house.total + mansion.total + barn.total + woodstock.total + stonestock.total + tannery.total + smithy.total + apothecary.total + temple.total + barracks.total + stable.total + mill.total + graveyard.total + fortification.total + battleAltar.total + fieldsAltar.total + underworldAltar.total + catAltar.total;
	document.getElementById('freeLand').innerHTML = prettify(land - Math.round(totalBuildings));
	document.getElementById('totalLand').innerHTML = prettify(land);
	document.getElementById('totalBuildings').innerHTML = prettify(Math.round(totalBuildings));
	//Unlock jobs predicated on having certain buildings
	if (smithy.total > 0) { setElemDisplay(document.getElementById('blacksmithgroup'),true); }
	if (tannery.total > 0) { setElemDisplay(document.getElementById('tannergroup'),true); }
	if (apothecary.total > 0) { setElemDisplay(document.getElementById('healergroup'),true); }
	if (temple.total > 0) { setElemDisplay(document.getElementById('clericgroup'),true); }
	if (barracks.total > 0) { setElemDisplay(document.getElementById('soldiergroup'),true); }
	if (stable.total > 0) { setElemDisplay(document.getElementById('cavalrygroup'),true); }

	//Unlock upgrades predicated on having certain buildings

	//At least one Temple is required to unlock Worship (It never disables again once enabled)
	if (temple.total > 0) { setElemDisplay(document.getElementById('deitySelect'),true); }
	document.getElementById('deity').disabled = upgrades.deity ||
		(temple.total < 1) || (piety.total < 1000);

	//At least one Barracks is required to unlock Standard (It never disables again once enabled)
	if (barracks.total > 0) { setElemDisplay(document.getElementById('conquestSelect'),true); }
	document.getElementById('standard').disabled = upgrades.standard ||
		(barracks.total < 1) || (leather.total < 1000) || (metal.total < 1000);

	// Enable trade tab once we've got gold (It never disables again once enabled)
	if (gold.total > 0) { setElemDisplay(document.getElementById('tradeSelect'),true); }

	// Need to have enough resources to trade
	document.getElementById('trade').disabled = (trader.time == 0) ||
		(trader.material.total < trader.requested);

	updatePopulation(); //updatePopulation() handles the population caps, which are determined by buildings.
}

function updatePopulation(){
	//Update population cap by multiplying out housing numbers
	population.cap = tent.total + (whut.total * 3) + (cottage.total * 6) + (house.total * (10 + (upgrades.tenements * 2) + (upgrades.slums * 2))) + (mansion.total * 50);
	//Update sick workers
	population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.healersIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
	//Display or hide the sick row
	if (population.totalSick > 0){
		setElemDisplay(document.getElementById('sickGroup'),true);
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
			console.log('Something has gone wrong. Population levels are: ' + population.unemployed + ', ' + population.farmers + ', ' + population.woodcutters + ', ' + population.miners + ', ' + population.blacksmiths + ', ' + population.healers + ', ' + population.clerics + ', ' + population.soldiers + ', ' + population.soldiersParty + ', ' + population.cavalry + ', ' + population.cavalryParty + ', ' + population.labourers);
		}
	}
	//Update page with numbers
	document.getElementById('popcurrent').innerHTML = prettify(population.current);
	document.getElementById('popcap').innerHTML = prettify(population.cap);
	document.getElementById('popzombies').innerHTML = prettify(population.zombies);
	document.getElementById('graves').innerHTML = prettify(population.graves);
	document.getElementById('sickTotal').innerHTML = prettify(population.totalSick);
	setElemDisplay(document.getElementById('gravesTotal'),(population.graves > 0));

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
			setElemDisplay(document.getElementById('spawn10'),true);
			elems = document.getElementsByClassName('job10');
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	if (population.current + population.zombies >= 100) {
		if (!customIncrements){
			setElemDisplay(document.getElementById('spawn100'),true);
			elems = document.getElementsByClassName('buildingten');
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
			elems = document.getElementsByClassName('job100');
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	if (population.current + population.zombies >= 1000) {
		if (!customIncrements){
			setElemDisplay(document.getElementById('spawn1000'),true);
			elems = document.getElementsByClassName('buildinghundred');
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
		setElemDisplay(document.getElementById('spawnMax'),true);

		elems = document.getElementsByClassName('jobAll');
		for(i = 0; i < elems.length; i++) {
			setElemDisplay(elems[i],true);
		}
		elems = document.getElementsByClassName('jobNone');
		for(i = 0; i < elems.length; i++) {
			setElemDisplay(elems[i],true);
		}
	}
	if (population.current + population.zombies >= 10000) {
		if (!customIncrements){
			elems = document.getElementsByClassName('buildingthousand');
			for(i = 0; i < elems.length; i++) {
				setElemDisplay(elems[i],true);
			}
		}
	}
	updateSpawnButtons();
	//Calculates and displays the cost of buying workers at the current population.
	document.getElementById('zombieCost').innerHTML = prettify(Math.round(calcZombieCost(1)));
	document.getElementById('workerCost').innerHTML = prettify(Math.round(calcWorkerCost(1)));
	document.getElementById('workerCost10').innerHTML = prettify(Math.round(calcWorkerCost(10)));
	document.getElementById('workerCost100').innerHTML = prettify(Math.round(calcWorkerCost(100)));
	document.getElementById('workerCost1000').innerHTML = prettify(Math.round(calcWorkerCost(1000)));
	var maxSpawn = Math.min((population.cap - population.current),logSearchFn(calcWorkerCost,food.total));
	document.getElementById('workerNumMax').innerHTML = prettify(Math.round(maxSpawn));
	document.getElementById('workerCostMax').innerHTML = prettify(Math.round(calcWorkerCost(maxSpawn)));
	updateJobs(); //handles the display of individual worker types
	updateMobs(); //handles the display of enemies
	updateHappiness();
	updateAchievements(); //handles display of achievements
}
function updateSpawnButtons(){
	//Turning on/off buttons based on free space.
	if ((population.current + 1) <= population.cap && food.total >= calcWorkerCost(1)){
		document.getElementById('spawn1').disabled = false;
	} else {
		document.getElementById('spawn1').disabled = true;
	}
	if ((population.current + 10) <= population.cap && food.total >= calcWorkerCost(10)){
		document.getElementById('spawn10button').disabled = false;
	} else {
		document.getElementById('spawn10button').disabled = true;
	}
	if ((population.current + 100) <= population.cap && food.total >= calcWorkerCost(100)){
		document.getElementById('spawn100button').disabled = false;
	} else {
		document.getElementById('spawn100button').disabled = true;
	}
	if ((population.current + 1000) <= population.cap && food.total >= calcWorkerCost(1000)){
		document.getElementById('spawn1000button').disabled = false;
	} else {
		document.getElementById('spawn1000button').disabled = true;
	}
	if ((population.current + 1) <= population.cap && food.total >= calcWorkerCost(1)){
		document.getElementById('spawnMaxbutton').disabled = false;
	} else {
		document.getElementById('spawnMaxbutton').disabled = true;
	}

	var canRaise = (deity.type == 'the Underworld' && deity.devotion >= 20);
	if (canRaise && (corpses.total >= 1) && piety.total >= calcZombieCost(1)){
		document.getElementById('raiseDead').disabled = false;
	} else {
		document.getElementById('raiseDead').disabled = true;
	}
	if (canRaise && (corpses.total >= 100) && piety.total >= calcZombieCost(100)){
		document.getElementById('raiseDead100').disabled = false;
	} else {
		document.getElementById('raiseDead100').disabled = true;
	}
	if (canRaise && (corpses.total >= 1) && piety.total >= calcZombieCost(1)){
		document.getElementById('raiseDeadMax').disabled = false;
	} else {
		document.getElementById('raiseDeadMax').disabled = true;
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
	document.getElementById('healers').innerHTML = prettify(population.healers);
	updateJobButtons('healers','healer',apothecary,1);
	document.getElementById('clerics').innerHTML = prettify(population.clerics);
	updateJobButtons('clerics','cleric',temple,1);
	document.getElementById('labourers').innerHTML = prettify(population.labourers);
	updateJobButtons('labourers','labourer',false,false);
	document.getElementById('soldiers').innerHTML = prettify(population.soldiers);
	updateJobButtons('soldiers','soldier',barracks,10);
	document.getElementById('cavalry').innerHTML = prettify(population.cavalry);
	updateJobButtons('cavalry','cavalry',stable,10);
	document.getElementById('corpses').innerHTML = prettify(corpses.total);
	document.getElementById('popzombies').innerHTML = prettify(population.zombies);
	document.getElementById('cats').innerHTML = prettify(population.cats);
	document.getElementById('enemiesSlain').innerHTML = prettify(population.enemiesSlain);
}
//xxx BUG:  This function isn't taking illness or deployment into account.
function updateJobButtons(job,name,building,support){
	var elem = document.getElementById(name + 'group');
	if (building){
		elem.children[0].children[0].disabled = (population[job] <   1); // None
		elem.children[2].children[0].disabled = (population[job] < 100); // -100
		elem.children[3].children[0].disabled = (population[job] <  10); // - 10
		elem.children[4].children[0].disabled = (population[job] <   1); // -  1

		if ((job == 'soldiers' && metal.total >= 10 && leather.total >= 10 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) 
			|| (job == 'cavalry' && food.total >= 20 && leather.total >= 20 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) 
			|| (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 1 && population[job] + 1 <= building.total * support)){ //1
			elem.children[7].children[0].disabled = false;
		} else {
			elem.children[7].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 100 && leather.total >= 100 && population.unemployed >= 10 && population[job] + 10 <= building.total * support) 
			|| (job == 'cavalry' && food.total >= 200 && leather.total >= 200 && population.unemployed >= 10 && population[job] + 10 <= building.total * support) 
			|| (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 10 && population[job] + 10 <= building.total * support)){ //10
			elem.children[8].children[0].disabled = false;
		} else {
			elem.children[8].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 1000 && leather.total >= 1000 && population.unemployed >= 100 && population[job] + 100 <= building.total * support) 
			|| (job == 'cavalry' && food.total >= 2000 && leather.total >= 2000 && population.unemployed >= 100 && population[job] + 100 <= building.total * support) 
			|| (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 100 && population[job] + 100 <= building.total * support)){ //100
			elem.children[9].children[0].disabled = false;
		} else {
			elem.children[9].children[0].disabled = true;
		}
		if ((job == 'soldiers' && metal.total >= 10 && leather.total >= 10 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) 
			|| (job == 'cavalry' && food.total >= 20 && leather.total >= 20 && population.unemployed >= 1 && population[job] + 1 <= building.total * support) 
			|| (job != 'soldiers' && job != 'cavalry' && population.unemployed >= 1 && population[job] + 1 <= building.total * support)){ //Max
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


// Check to see if the player has an upgrade and hide as necessary
// Check also to see if the player can afford an upgrade and enable/disable as necessary
function updateUpgrades(){

// Internal convenience function
// Pass the name of the upgrade and a boolean indicating if it should be enabled.
// upgradeId - The ID of the upgrade.
// havePrice - Can the player afford to buy it?
// havePrereqs - Does the player have the prereqs? [optional; if omitted, assume no prereqs]
function updateUpgrade(upgradeId, havePrice, havePrereqs) {
	if (havePrereqs === undefined) { havePrereqs = true; } // No prereqs
	setElemDisplay(document.getElementById(upgradeId+'Line'),(havePrereqs && (upgrades[upgradeId] != 1)));
	setElemDisplay(document.getElementById('P'+upgradeId),(upgrades[upgradeId] == 1));
	// If we can get it but haven't yet, it's visible; update its enabled status.
	if (havePrereqs && upgrades[upgradeId] != 1){ document.getElementById(upgradeId).disabled = (!havePrice); }
}

	updateUpgrade('domestication'    , (leather.total >= 20));
	updateUpgrade('ploughshares'     , (metal.total >= 20));
	updateUpgrade('irrigation'       , (wood.total >= 500 && stone.total >= 200));
	updateUpgrade('skinning'         , (skins.total >= 10));
	updateUpgrade('harvesting'       , (herbs.total >= 10));
	updateUpgrade('prospecting'      , (ore.total >= 10));
	updateUpgrade('butchering'       , (leather.total >= 40), upgrades.skinning);
	updateUpgrade('gardening'        , (herbs.total >= 40), upgrades.harvesting);
	updateUpgrade('extraction'       , (metal.total >= 40), upgrades.prospecting);
	updateUpgrade('croprotation'     , (herbs.total >= 5000 && piety.total >= 1000));
	updateUpgrade('selectivebreeding', (skins.total >= 5000 && piety.total >= 1000));
	updateUpgrade('fertilisers'      , (ore.total >= 5000 && piety.total >= 1000));
	updateUpgrade('flensing'         , (metal.total >= 1000));
	updateUpgrade('macerating'       , (leather.total >= 500 && stone.total >= 500));

	//BUILDING TECHS
	//masonry
	updateUpgrade('masonry'          , (wood.total >= 100 && stone.total >= 100));
	if (upgrades.masonry == 1){
		//unlock masonry buildings
		setElemDisplay(document.getElementById('cottageRow'),true);
		setElemDisplay(document.getElementById('tanneryRow'),true);
		setElemDisplay(document.getElementById('smithyRow'),true);
		setElemDisplay(document.getElementById('apothecaryRow'),true);
		setElemDisplay(document.getElementById('templeRow'),true);
		setElemDisplay(document.getElementById('barracksRow'),true);
		//unlock masonry upgrades
		setElemDisplay(document.getElementById('constructionLine'),true);
		setElemDisplay(document.getElementById('basicFarming'),true);
		setElemDisplay(document.getElementById('granariesLine'),true);
		setElemDisplay(document.getElementById('masonryTech'),true);
	}
	//construction
	updateUpgrade('construction'     , (wood.total >= 1000 && stone.total >= 1000), upgrades.masonry);
	if (upgrades.construction == 1){
		//unlock construction buildings
		setElemDisplay(document.getElementById('houseRow'),true);
		//unlock construction upgrades
		setElemDisplay(document.getElementById('architectureLine'),true);
		setElemDisplay(document.getElementById('specialFarming'),true);
		setElemDisplay(document.getElementById('tenementsLine'),true);
		setElemDisplay(document.getElementById('palisadeLine'),true);
	}
	//architecture
	updateUpgrade('architecture'     , (wood.total >= 10000 && stone.total >= 10000), upgrades.construction);
	if (upgrades.architecture == 1){
		//unlock architecture buildings
		setElemDisplay(document.getElementById('mansionRow'),true);
		setElemDisplay(document.getElementById('fortificationRow'),true);
		//unlock architecture upgrades
		setElemDisplay(document.getElementById('improvedFarming'),true);
		setElemDisplay(document.getElementById('specFreq'),true);
		setElemDisplay(document.getElementById('slumsLine'),true);
		setElemDisplay(document.getElementById('civilserviceLine'),true);
		setElemDisplay(document.getElementById('wonderLine'),true);
	} 
	//wheel
	updateUpgrade('wheel'            , (wood.total >= 500 && stone.total >= 500));
	if (upgrades.wheel == 1){
		setElemDisplay(document.getElementById('millRow'),true);
	}
	//horseback
	updateUpgrade('horseback'        , (food.total >= 500 && wood.total >= 500));
	if (upgrades.horseback == 1){
		setElemDisplay(document.getElementById('stableRow'),true);
		setElemDisplay(document.getElementById('fcavalrygroup'),true);
	}

	updateUpgrade('tenements'        , (food.total >= 200 && wood.total >= 500 && stone.total >= 500), upgrades.construction);
	updateUpgrade('slums'            , (food.total >= 500 && wood.total >= 1000 && stone.total >= 1000), upgrades.architecture);
	updateUpgrade('granaries'        , (wood.total >= 1000 && stone.total >= 1000), upgrades.masonry);
	updateUpgrade('palisade'         , (wood.total >= 2000 && stone.total >= 1000), upgrades.construction);
	updateUpgrade('weaponry'         , (wood.total >= 500 && metal.total >= 500), upgrades.masonry);
	updateUpgrade('shields'          , (wood.total >= 500 && leather.total >= 500), upgrades.masonry);
	updateUpgrade('writing'          , (skins.total >= 500), upgrades.masonry);
	updateUpgrade('administration'   , (stone.total >= 1000 && skins.total >= 1000));
	updateUpgrade('codeoflaws'       , (stone.total >= 1000 && skins.total >= 1000));
	updateUpgrade('mathematics'      , (herbs.total >= 1000 && piety.total >= 1000));
	setElemDisplay(document.getElementById('fsiegegroup'), (upgrades.mathematics == 1));
	updateUpgrade('aesthetics'       , (piety.total >= 5000));
	updateUpgrade('civilservice'     , (piety.total >= 5000), upgrades.architecture);
	setElemDisplay(document.getElementById('civilTech'), (upgrades.civilservice == 1));
	updateUpgrade('feudalism'        , (piety.total >= 10000));
	updateUpgrade('guilds'           , (piety.total >= 10000));
	updateUpgrade('serfs'            , (piety.total >= 20000));
	updateUpgrade('nationalism'      , (piety.total >= 50000));

	//deity techs
	setElemDisplay(document.getElementById('deityLine'),(upgrades.deity != 1));
	setElemDisplay(document.getElementById('Pworship'),(upgrades.deity == 1));
	document.getElementById('renameDeity').disabled = (upgrades.deity != 1);
	if (upgrades.deity == 1){
		setElemDisplay(document.getElementById('deitySpecialisation'),(deity.type == ""));
		setElemDisplay(document.getElementById('battleUpgrades'),(deity.type == "Battle"));
		setElemDisplay(document.getElementById('fieldsUpgrades'),(deity.type == "the Fields"));
		setElemDisplay(document.getElementById('underworldUpgrades'),(deity.type == "the Underworld"));
		setElemDisplay(document.getElementById('zombieWorkers'), (population.zombies > 0));
		setElemDisplay(document.getElementById('catsUpgrades'),(deity.type == "Cats"));
	}
	//standard
	setElemDisplay(document.getElementById('standardLine'),(upgrades.standard != 1));
	setElemDisplay(document.getElementById('Pstandard'),(upgrades.standard == 1));
	setElemDisplay(document.getElementById('conquest'),(upgrades.standard == 1));
	if (upgrades.standard == 1) { updateTargets(); }

	// Another internal convenience function (a subset of updateUpgrade())
	function enableIfOwned(upgradeId) {
		if (upgrades[upgradeId] == 1){
			document.getElementById(upgradeId).disabled = true;
			setElemDisplay(document.getElementById('P'+upgradeId),true); } 
	}

	//cats
	enableIfOwned('lure');
	enableIfOwned('companion');
	enableIfOwned('comfort');
	//fields
	enableIfOwned('blessing');
	enableIfOwned('waste');
	enableIfOwned('stay');
	//battle
	enableIfOwned('riddle');
	enableIfOwned('throne');
	enableIfOwned('lament');
	//underworld
	enableIfOwned('book');
	enableIfOwned('feast');
	enableIfOwned('secrets');

	//trade
	setElemDisplay(document.getElementById('tradeLine'),(upgrades.trade != 1));
	setElemDisplay(document.getElementById('Ptrade'),(upgrades.trade == 1));
	setElemDisplay(document.getElementById('tradeUpgradeContainer'),(upgrades.trade == 1));
	updateUpgrade('currency'         , (gold.total >= 10 && ore.total >= 1000));
	updateUpgrade('commerce'         , (gold.total >= 100 && ore.total >= 10000));
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
		setElemDisplay(document.getElementById('oldDeities'),true);
		setElemDisplay(document.getElementById('iconoclasmGroup'),true);
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
	setElemDisplay(document.getElementById('wolfgroup'), (population.wolves > 0));
	document.getElementById('wolves').innerHTML = prettify(population.wolves);
	setElemDisplay(document.getElementById('banditgroup'), (population.bandits > 0));
	document.getElementById('bandits').innerHTML = prettify(population.bandits);
	setElemDisplay(document.getElementById('barbariangroup'), (population.barbarians > 0));
	document.getElementById('barbarians').innerHTML = prettify(population.barbarians);
	setElemDisplay(document.getElementById('esiegegroup'), (population.esiege > 0));
	document.getElementById('esiege').innerHTML = prettify(population.esiege);
	setElemDisplay(document.getElementById('shadesgroup'), (population.shades > 0));
	document.getElementById('shades').innerHTML = prettify(population.shades);
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
	// raiseDead buttons updated by UpdateSpawnButtons
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
	var displayNode = document.getElementById(buildingObj.id + 'Cost');
	if (displayNode) { displayNode.innerHTML = getReqText(buildingObj.require); }
}

function updateAchievements(){
	//Displays achievements if they are unlocked
	//civ size
	if (achievements.hamlet) { setElemDisplay(document.getElementById('achHamlet'),true); }
	if (achievements.village) { setElemDisplay(document.getElementById('achVillage'),true); }
	if (achievements.smallTown) { setElemDisplay(document.getElementById('achSmallTown'),true); }
	if (achievements.largeTown) { setElemDisplay(document.getElementById('achLargeTown'),true); }
	if (achievements.smallCity) { setElemDisplay(document.getElementById('achSmallCity'),true); }
	if (achievements.largeCity) { setElemDisplay(document.getElementById('achLargeCity'),true); }
	if (achievements.metropolis) { setElemDisplay(document.getElementById('achMetropolis'),true); }
	if (achievements.smallNation) { setElemDisplay(document.getElementById('achSmallNation'),true); }
	if (achievements.nation) { setElemDisplay(document.getElementById('achNation'),true); }
	if (achievements.largeNation) { setElemDisplay(document.getElementById('achLargeNation'),true); }
	if (achievements.empire) { setElemDisplay(document.getElementById('achEmpire'),true); }
	//conquest
	if (achievements.raider) { setElemDisplay(document.getElementById('achRaider'),true); }
	if (achievements.engineer) { setElemDisplay(document.getElementById('achEngineer'),true); }
	if (achievements.domination) { setElemDisplay(document.getElementById('achDomination'),true); }
	//happiness
	if (achievements.hated) { setElemDisplay(document.getElementById('achHated'),true); }
	if (achievements.loved) { setElemDisplay(document.getElementById('achLoved'),true); }
	//other population
	if (achievements.plague) { setElemDisplay(document.getElementById('achPlague'),true); }
	if (achievements.ghostTown) { setElemDisplay(document.getElementById('achGhostTown'),true); }
	//cats
	if (achievements.cat) { setElemDisplay(document.getElementById('achCat'),true); }
	if (achievements.glaring) { setElemDisplay(document.getElementById('achGlaring'),true); }
	if (achievements.clowder) { setElemDisplay(document.getElementById('achClowder'),true); }
	//deities
	if (achievements.battle) { setElemDisplay(document.getElementById('achBattle'),true); }
	if (achievements.cats) { setElemDisplay(document.getElementById('achCats'),true); }
	if (achievements.fields) { setElemDisplay(document.getElementById('achFields'),true); }
	if (achievements.underworld) { setElemDisplay(document.getElementById('achUnderworld'),true); }
	if (achievements.fullHouse) { setElemDisplay(document.getElementById('achFullHouse'),true); }
	//wonders
	if (achievements.wonder) { setElemDisplay(document.getElementById('achWonder'),true); }
	if (achievements.seven) { setElemDisplay(document.getElementById('achSeven'),true); }
	//trading
	if (achievements.merchant) { setElemDisplay(document.getElementById('achMerchant'),true); }
	if (achievements.rushed) { setElemDisplay(document.getElementById('achRushed'),true); }
	//other
	if (achievements.neverclick) { setElemDisplay(document.getElementById('achNeverclick'),true); }
}

function updateParty(){
	//updates the party (and enemies)
	document.getElementById('soldiersParty').innerHTML = prettify(population.soldiersParty);
	document.getElementById('cavalryParty').innerHTML = prettify(population.cavalryParty);
	document.getElementById('siegeParty').innerHTML = prettify(population.siege);
	document.getElementById('esoldiers').innerHTML = prettify(population.esoldiers);
	document.getElementById('eforts').innerHTML = prettify(population.eforts);
	document.getElementById('esoldiergroup').style.display = (population.esoldiers > 0) ? 'table-row' : 'none';
	document.getElementById('efortgroup').style.display = (population.eforts > 0) ? 'table-row' : 'none';
}

function updatePartyButtons(){
	var fsolgroup, fcavgroup, fsgegroup;
	var pacifist = !upgrades.standard;

	fsolgroup = document.getElementById('fsoldiergroup');
	fsolgroup.children[ 0].children[0].disabled = pacifist || (population.soldiersParty <   1); // None
	fsolgroup.children[ 2].children[0].disabled = pacifist || (population.soldiersParty < 100); // -100
	fsolgroup.children[ 3].children[0].disabled = pacifist || (population.soldiersParty <  10); // - 10
	fsolgroup.children[ 4].children[0].disabled = pacifist || (population.soldiersParty <   1); // -  1
	fsolgroup.children[ 7].children[0].disabled = pacifist || (population.soldiers      <   1); //    1
	fsolgroup.children[ 8].children[0].disabled = pacifist || (population.soldiers      <  10); //   10
	fsolgroup.children[ 9].children[0].disabled = pacifist || (population.soldiers      < 100); //  100
	fsolgroup.children[11].children[0].disabled = pacifist || (population.soldiers      <   1); //  Max

	fcavgroup = document.getElementById('fcavalrygroup');
	fcavgroup.children[ 0].children[0].disabled = pacifist || (population.cavalryParty <   1); // None
	fcavgroup.children[ 2].children[0].disabled = pacifist || (population.cavalryParty < 100); // -100
	fcavgroup.children[ 3].children[0].disabled = pacifist || (population.cavalryParty <  10); // - 10
	fcavgroup.children[ 4].children[0].disabled = pacifist || (population.cavalryParty <   1); // -  1
	fcavgroup.children[ 7].children[0].disabled = pacifist || (population.cavalry      <   1); //    1
	fcavgroup.children[ 8].children[0].disabled = pacifist || (population.cavalry      <  10); //   10
	fcavgroup.children[ 9].children[0].disabled = pacifist || (population.cavalry      < 100); //  100
	fcavgroup.children[11].children[0].disabled = pacifist || (population.cavalry      <   1); //  Max

	fsgegroup = document.getElementById('fsiegegroup');
	fsgegroup.children[ 7].children[0].disabled = pacifist ||  
		(metal.total <   50 || leather.total <   50 || wood.total <   200); //   1
	fsgegroup.children[ 8].children[0].disabled = pacifist ||  
		(metal.total <  500 || leather.total <  500 || wood.total <  2000); //  10
	fsgegroup.children[ 9].children[0].disabled = pacifist ||  
		(metal.total < 5000 || leather.total < 5000 || wood.total < 20000); // 100
	// Siege max disabled; too easy to overspend.
	// fsgegroup.children[11].children[0].disabled = pacifist ||  
	//	(metal.total <   50 || leather.total <   50 || wood.total <   200); // Max
}

// Enable the raid buttons for eligible targets.
function updateTargets(){
	var i;
	var raidButtons = document.getElementsByClassName('raid');
	var haveArmy = ((population.soldiersParty + population.cavalryParty) > 0);
	var curElem;
	for(i=0;i<raidButtons.length;++i)
	{
		// Disable if we have no army, or they are too big a target.
		curElem = raidButtons[i];
		curElem.disabled = ((!haveArmy) || (civSizes[dataset(curElem,'civtype')] > civSizes[targetMax]));
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
			document.getElementById('progressBar').style.width = wonder.progress.toFixed(2) + '%';
			document.getElementById('progressNumber').innerHTML = wonder.progress.toFixed(2);
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
	updateBuildingRow(tent);
	updateBuildingRow(whut);
	updateBuildingRow(cottage);
	updateBuildingRow(house);
	updateBuildingRow(mansion);
	updateBuildingRow(barn);
	updateBuildingRow(woodstock);
	updateBuildingRow(stonestock);
	updateBuildingRow(tannery);
	updateBuildingRow(smithy);
	updateBuildingRow(apothecary);
	updateBuildingRow(temple);
	updateBuildingRow(barracks);
	updateBuildingRow(stable);
	updateBuildingRow(graveyard);
	updateBuildingRow(mill);
	updateBuildingRow(fortification);
	updateBuildingRow(battleAltar);
	updateBuildingRow(underworldAltar);
	updateBuildingRow(fieldsAltar);
	updateBuildingRow(catAltar);
}

function updateBuildingRow(buildingObj){
	var i;
	//this works by trying to access the children of the table rows containing the buttons in sequence
	var numBuildable = canAfford(buildingObj.require);
	for (i=0;i<4;i++){
		try { // try-catch required because fortifications, mills, and altars do not have more than one child button. 
		      // This should probably be cleaned up in the future.
		      // Fortunately the index numbers of the children map directly onto the powers of 10 used by the buttons
				document.getElementById(buildingObj.id + 'Row').children[i].children[0].disabled = (numBuildable < Math.pow(10,i));
		} catch(ignore){}
	}		
	try { document.getElementById(buildingObj.id + 'Row').children[4].children[0].disabled = (numBuildable < 1); } catch(ignore){} //Custom button
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
	//console.log('Update loop execution time: ' + time + 'ms'); //temporary altered to return time in order to run a debugging function
	return time;
}


// Game functions

function increment(material){
	var specialAmount, specialMaterial, activity;
	//This function is called every time a player clicks on a primary resource button
	resourceClicks += 1;
	document.getElementById("clicks").innerHTML = prettify(Math.round(resourceClicks));
	material.total = material.total + material.increment + (material.increment * 9 * upgrades.civilservice) + (material.increment * 40 * upgrades.feudalism) + (upgrades.serfs * Math.floor(Math.log(population.unemployed * 10 + 1))) + (upgrades.nationalism * Math.floor(Math.log((population.soldiers + population.cavalry) * 10 + 1)));
	//Handles random collection of special resources.
	if (Math.random() < material.specialchance){
		specialAmount = material.increment * (1 + (9 * upgrades.guilds));
		if (material == food)  { specialMaterial = skins; activity = 'foraging'; }
		if (material == wood)  { specialMaterial = herbs; activity = 'woodcutting'; }
		if (material == stone) { specialMaterial = ore; activity = 'mining'; }
		specialMaterial.total += specialAmount;
		gameLog('Found ' + specialMaterial.name + ' while ' + activity);
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
	//Then deduct resources
	num = payFor(building.require,num);
	if (num > 0) {
		//Then increment the total number of that building
		building.total += num;
		//Increase devotion if the building was an altar.
		if (isValid(building.devotion)) { deity.devotion += building.devotion * num; }
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
		updateResourceTotals(); //Update page with lower resource values and higher building total
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
function getCustomBuildNumber() { return getCustomNumber('buildCustom'); }
function getCustomSpawnNumber() { return getCustomNumber('spawnCustom'); }
function getCustomJobNumber()   { return getCustomNumber('jobCustom'  ); }
function getCustomArmyNumber()  { return getCustomNumber('armyCustom' ); }

//builds a custom number of buildings
function buildCustom(building) { createBuilding(building,getCustomBuildNumber()); }

//Calculates and returns the cost of adding a certain number of workers at the present population
function calcWorkerCost(num, curPop){
	if (curPop === undefined) { curPop = population.current; }
	return (20*num) + calcArithSum(0.01, curPop, curPop + num);
}
function calcZombieCost(num){ return calcWorkerCost(num, population.zombies)/5; }


//Potentially create a cat
function maybeSpawnCat()
{
	//This is intentionally independent of the number of workers spawned
	if (Math.random() * 100 >= 1 + upgrades.lure) { return 0; }

	gameLog('Found a cat!');
	++population.cats;
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

// Creates or destroys workers
function spawn(num){
	if (num == 'custom') { num = getCustomSpawnNumber(); }
	if (num == 'negcustom') { num = -getCustomSpawnNumber(); }

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

	maybeSpawnCat();

	updateResourceTotals(); //update with new resource number
	updatePopulation(); //Run through the population->job update cycle
	
	return num;
}

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
	} else if (population.healersIll > 0){ population.healersIll -= 1; }
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
	} else if (population.healers > 0){ population.healers -= 1; }
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
	corpses.total += 1;
	//Workers dying may trigger Book of the Dead
	if (upgrades.book) {
		piety.total += 10;
	}
}

// Hires or fires workers to/from a specific job.
// Pass a positive number to hire, a negative number to fire.
// If it can't add/remove as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass 'custom' or 'negcustom' to use the custom increment.
// Returns the actual number hired or fired (negative if fired).
function hire(job,num){
	var buildingLimit = Infinity; // Additional limit from buildings.
	var resourceNeeds = {};
	if (num == 'custom')    { num =  getCustomJobNumber(); }
	if (num == 'negcustom') { num = -getCustomJobNumber(); }

	num = Math.min(num, population.unemployed);  // Cap hiring by # of available workers.
	num = Math.max(num, -population[job]);  // Cap firing by # in that job.
	
	// See if this job has limits from buildings or resource costs.
	if (job == 'tanners')     { buildingLimit =    tannery.total; }
	if (job == 'blacksmiths') { buildingLimit =    smithy.total; }
	if (job == 'healers')     { buildingLimit =    apothecary.total; }
	if (job == 'clerics')     { buildingLimit =    temple.total; }
	if (job == 'soldiers')    { buildingLimit = 10*barracks.total; resourceNeeds = { metal:10, leather:10 }; }
	if (job == 'cavalry')     { buildingLimit = 10*stable.total;   resourceNeeds = {  food:20, leather:20 }; }

	// Check the building limit against the current numbers (including sick and
	// partied units, if applicable).
	num = Math.min(num, buildingLimit - population[job] - population[job+'Ill'] 
	    - (isValid(population[job+'Party']) ? population[job+'Party'] : 0) );

	// Tries to pay for them; returns fewer if we can't afford them all
	num = payFor(resourceNeeds, num);

	// Do the actual hiring
	population[job] += num;
	population.unemployed -= num;

	if (isValid(population[job+'Cas'])) // If this unit can have casualties
	{
		population[job+'Cas'] += num;
		// It's possible that firing the last unit, if injured, could put its 'Cas' negative
		if (population[job+'Cas'] < 0) { population[job+'Cas'] = 0; }
	}

	updateJobs(); // Updates the page with the num in each job.

	return num;
}


// Creates or destroys zombies
// Pass a positive number to create, a negative number to destroy.
// Only unemployed zombies can be destroyed.
// If it can't create/destroy as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass 'custom' or 'negcustom' to use the custom increment.
// Returns the actual number created or destroyed (negative if destroyed).
function raiseDead(num){
	if (num == 'custom') { num = getCustomSpawnNumber(); }
	if (num == 'negcustom') { num = -getCustomSpawnNumber(); }

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
	if (piety.total < 1000) { return; }
	if (population.enemiesSlain <= 0) { return; }

	piety.total -= 1000;
	var num = Math.ceil(population.enemiesSlain/4 + (Math.random() * population.enemiesSlain/4));
	population.enemiesSlain -= num;
	population.shades += num;
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
		updateResourceTotals(); //due to resource limits increasing
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

function randomHealthyWorker(){
	//Selects a random healthy worker based on their proportions in the current job distribution.
	var num = Math.random(),
		pUnemployed = population.unemployed / population.healthy,
		pFarmer = population.farmers / population.healthy,
		pWoodcutter = population.woodcutters / population.healthy,
		pMiner = population.miners / population.healthy,
		pTanner = population.tanners / population.healthy,
		pBlacksmith = population.blacksmiths / population.healthy,
		pHealer = population.healers / population.healthy,
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
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pHealer)
		{ return 'healer'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pHealer + pCleric)
		{ return 'cleric'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pHealer + pCleric + pLabourer)
		{ return 'labourer'; } 
	if (num <= pUnemployed + pFarmer + pWoodcutter + pMiner + pTanner + pBlacksmith + pHealer + pCleric + pLabourer + pCavalry)
		{ return 'cavalry'; } 

	return 'soldier';
}

function wickerman(){
	//Selects a random worker, kills them, and then adds a random resource
	if (population.healthy > 0 && wood.total >= 500){
		//Select and kill random worker
		var selected = randomHealthyWorker();
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
		if (selected == 'healer'){
			population.healers -= 1;
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
		gameLog("Burned a " + selected + ". " + msg);
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
				selected = randomHealthyWorker();
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
				if (selected == 'healer' && population.healers > 0){
					population.healers -= 1;
					population.healersIll += 1;
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
			population.totalSick = population.farmersIll + population.woodcuttersIll + population.minersIll + population.tannersIll + population.blacksmithsIll + population.healersIll + population.clericsIll + population.labourersIll + population.soldiersIll + population.cavalryIll + population.unemployedIll;
			population.healthy = population.unemployed + population.farmers + population.woodcutters + population.miners + population.tanners + population.blacksmiths + population.healers + population.clerics + population.labourers + population.soldiers + population.cavalry - population.zombies;
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
			corpses.total += population.barbarians;
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
			corpses.total += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	if (population.bandits > 0){
		if (piety.total >= population.bandits * 100){
			piety.total -= population.bandits * 100;
			population.enemiesSlain += population.bandits;
			corpses.total += population.bandits;
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
			corpses.total += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	if (population.wolves > 0){
		if (piety.total >= population.wolves * 100){
			piety.total -= population.wolves * 100;
			population.enemiesSlain += population.wolves;
			corpses.total += population.wolves;
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
			corpses.total += num;
			piety.total -= num * 100;
			if (upgrades.throne) { throneCount += num; }
			if (upgrades.book) { piety.total += num * 10; }
		}
	}
	updateResourceTotals();
	updateMobs();
}

/* War Functions */

//Adds or removes soldiers from army
function party(job,num){
	if (num == 'custom') { num = getCustomArmyNumber(); }
	if (num == 'negcustom') { num = -getCustomArmyNumber(); }

	if (job == "soldiersParty"){
		// checks that there are sufficient soldiers to remove from pool
		num = Math.min(num, population.soldiers);
		// checks that there are sufficient soldiers to remove from army
		num = Math.max(num, -population.soldiersParty);
		population.soldiersParty += num;
		population.soldiersPartyCas += num;
		population.soldiers -= num;
		population.soldiersCas -= num;
	}
	if (job == "cavalryParty"){
		// checks that there are sufficient cavalry to remove from pool
		num = Math.min(num, population.cavalry);
		// checks that there are sufficient cavalry to remove from army
		num = Math.max(num, -population.cavalryParty);
		population.cavalryParty += num;
		population.cavalryPartyCas += num;
		population.cavalry -= num;
		population.cavalryCas -= num;
	}
	if (job == 'siegeParty'){
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
	updateParty(); //updates the army display
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
	updateParty();
	document.getElementById('raidGroup').style.display = 'none'; //Hides raid buttons until the raid is finished
}
function onInvade(event) { return invade(dataset(event.target,'civtype')); }

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
	updateResourceTotals();
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
		{ document.getElementById('limited').innerHTML = " by low " + lowItem; }
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
	var baseAmt = Math.ceil(Math.random() * 20);
	if (random < 1/8){
		trader.material = food;
		trader.requested = 5000 * baseAmt;
	} else if (random < 2/8){
		trader.material = wood;
		trader.requested = 5000 * baseAmt;
	} else if (random < 3/8){
		trader.material = stone;
		trader.requested = 5000 * baseAmt;
	} else if (random < 4/8){
		trader.material = skins;
		trader.requested = 500 * baseAmt;
	} else if (random < 5/8){
		trader.material = herbs;
		trader.requested = 500 * baseAmt;
	} else if (random < 6/8){
		trader.material = ore;
		trader.requested = 500 * baseAmt;
	} else if (random < 7/8){
		trader.material = leather;
		trader.requested = 250 * baseAmt;
	} else {
		trader.material = metal;
		trader.requested = 250 * baseAmt;
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
		wonder.progress += 1 / (Math.pow(1.5,wonder.total));
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
		corpses:corpses,
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
	civName = prompt('Please name your civilisation',civName);
	if (!civName) { civName = "Woodstock"; }
	document.getElementById('civName').innerHTML = civName;
}
function renameRuler(){
	//Prompts player, uses result as rulerName
	rulerName = prompt('What is your name?',rulerName);
	if (!rulerName) { rulerName = "Orteil"; }
	document.getElementById('rulerName').innerHTML = rulerName;
}
function renameDeity(){
	//Prompts player, uses result as deity.name - called when first getting a deity
	deity.name = prompt('Who do your people worship?',deity.name);
	if (!deity.name) { deity.name = rulerName; } // Hey, despots tend to have big egos.
	updateDeity();
}

function reset(){
	//Resets the game, keeping some values but resetting most back to their initial values.
	var msg = 'Really reset? You will keep past deities and wonders (and cats)'; //Check player really wanted to do that.
	if (!confirm(msg)) { return false; } // declined

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
		farmers:0.2 + (0.1 * upgrades.blessing),
		pestBonus:0,
		woodcutters:0.5,
		miners:0.2,
		tanners:0.5,
		blacksmiths:0.5,
		healers:0.1,
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
	document.getElementById('healergroup').style.display = 'none';
	document.getElementById('clericgroup').style.display = 'none';
	document.getElementById('soldiergroup').style.display = 'none';
	document.getElementById('cavalrygroup').style.display = 'none';
	document.getElementById('conquest').style.display = 'none';
	document.getElementById('basicFarming').style.display = 'none';
	document.getElementById('specialFarming').style.display = 'none';
	document.getElementById('improvedFarming').style.display = 'none';
	document.getElementById('masonryTech').style.display = 'none';

	document.getElementById('tradeContainer').style.display = 'none';
	document.getElementById('tradeUpgradeContainer').style.display = 'none';
	document.getElementById('startWonder').disabled = false;
	document.getElementById('wonderLine').style.display = 'none';
	document.getElementById('iconoclasmList').innerHTML = '';
	document.getElementById('iconoclasm').disabled = false;
	gameLog('Game Reset'); //Inform player.

	renameCiv();
	renameRuler();
}

function doHealers() {
	if (population.totalSick <= 0) { return 0; } // Everyone's fine.
    var numHealers = population.healers + (population.cats * upgrades.companion);
	if (numHealers <= 0) { return 0; }  // No healers.

	//Healers curing sick people
	for (i=0;i<numHealers;i++){
		if (herbs.total < 1) { break; } // Out of herbs
		//Increment efficiency counter
		cureCounter += (efficiency.healers * efficiency.happiness);
		while (cureCounter >= 1 && herbs.total >= 1){ //OH GOD WHY AM I USING THIS
			//Decrement counter
			//This is doubly important because of the While loop
			cureCounter -= 1;
			//Select a sick worker to cure, with certain priorities
			if (population.healersIll > 0){ //Don't all get sick
				population.healersIll -= 1;
				population.healers += 1;
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
	updatePopulation();
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
	food.net = population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus) * (1 + (wonder.food/10)) * (1 + walkTotal/120) * (1 + mill.total * millMod / 200); //Farmers farm food
	food.net -= population.current; //The living population eats food.
	food.total += food.net;
	if (upgrades.skinning == 1 && population.farmers > 0){ //and sometimes get skins
		var num_skins = food.specialchance * (food.increment + (upgrades.butchering * population.farmers / 15.0)) * (1 + (wonder.skins/10));
		skins.total += Math.floor(num_skins);
		if (Math.random() < (num_skins - Math.floor(num_skins))) { ++skins.total; }
	}
	wood.net = population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood/10)); //Woodcutters cut wood
	wood.total += wood.net;
	if (upgrades.harvesting == 1 && population.woodcutters > 0){ //and sometimes get herbs
		var num_herbs = wood.specialchance * (wood.increment + (upgrades.gardening * population.woodcutters / 5.0)) * (1 + (wonder.wood/10));
		herbs.total += Math.floor(num_herbs);
		if (Math.random() < (num_herbs - Math.floor(num_herbs))) { ++herbs.total; }
	}
	stone.net = population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone/10)); //Miners mine stone
	stone.total += stone.net;
	if (upgrades.prospecting == 1 && population.miners > 0){ //and sometimes get ore
		var num_ore = stone.specialchance * (stone.increment + (upgrades.extraction * population.miners / 5.0)) * (1 + (wonder.ore/10));
		ore.total += Math.floor(num_ore);
		if (Math.random() < (num_ore - Math.floor(num_ore))) { ++ore.total; }
	}
	var starve;
	if (food.total < 0) { //and will starve if they don't have enough
		if (upgrades.waste && corpses.total >= (food.total * -1)){ //population eats corpses instead
			corpses.total = Math.floor(corpses.total + food.total);
		} else if (upgrades.waste && corpses.total > 0){ //corpses mitigate starvation
			starve = Math.ceil((population.current - corpses.total)/1000);
			if (starve == 1) { gameLog('A worker starved to death'); }
			if (starve > 1) { gameLog(prettify(starve) + ' workers starved to death'); }
			for (i=0; i<starve; i++){
				jobCull();
			}
			updateJobs();
			corpses.total = 0;
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
	var stealable=[food,wood,stone,skins,herbs,ore,leather,metal];
	var num,stolenQty;
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
				corpses.total += (casFloor + mobCasFloor);
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
				corpses.total += (casFloor + mobCasFloor);
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
				target = randomHealthyWorker();
				if (Math.random() > 0.5){ //Wolves will sometimes not disappear after eating someone
					population.wolves -= 1;
					population.wolvesCas -= 1;
				}
				if (population.wolvesCas < 0) { population.wolvesCas = 0; }
				console.log('Wolves ate a ' + target);
                gameLog('Wolves ate a ' + target);
				population.current -= 1;
				if      (target == "unemployed") { population.unemployed -= 1; } 
				else if (target == "farmer")     { population.farmers -= 1; } 
				else if (target == "woodcutter") { population.woodcutters -= 1; } 
				else if (target == "miner")      { population.miners -= 1; } 
				else if (target == "tanner")     { population.tanners -= 1; } 
				else if (target == "blacksmith") { population.blacksmiths -= 1; } 
				else if (target == "healer")     { population.healers -= 1; } 
				else if (target == "cleric")     { population.clerics -= 1; } 
				else if (target == "labourer")   { population.labourers -= 1; } 
				else if (target == "soldier"){
					population.soldiers -= 1;
					population.soldiersCas -= 1;
					if (population.soldiersCas < 0){
						population.soldiers = 0;
						population.soldiersCas = 0;
					}
				} else if (target == "cavalry"){
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
				corpses.total += (casFloor + mobCasFloor);
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
				corpses.total += (casFloor + mobCasFloor);
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
			target = stealable[Math.floor(Math.random() * stealable.length)];
			stolenQty = Math.floor((Math.random() * 1000)); //Steal up to 1000.
			stolenQty = Math.min(stolenQty,target.total);
			if (stolenQty > 0) { gameLog('Bandits stole ' + stolenQty + ' ' + target.name); }
			target.total -= stolenQty;
			if (target.total <= 0) {
				//some will leave
				leaving = Math.ceil(population.bandits * Math.random() * (1/8));
				population.bandits -= leaving;
				population.banditsCas -= leaving;
				updateMobs();
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
				corpses.total += (casFloor + mobCasFloor);
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
				corpses.total += (casFloor + mobCasFloor);
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
					target = randomHealthyWorker(); //Choose random worker
					population.barbarians -= 1; //Barbarians always disappear after killing
					population.barbariansCas -= 1;
					if (population.barbariansCas < 0) { population.barbariansCas = 0; }
					console.log('Barbarians killed a ' + target);
					gameLog('Barbarians killed a ' + target);

					population.current -= 1;
					if (target == "unemployed")      { population.unemployed -= 1; } 
					else if (target == "farmer")     { population.farmers -= 1; } 
					else if (target == "woodcutter") { population.woodcutters -= 1; } 
					else if (target == "miner")      { population.miners -= 1; } 
					else if (target == "tanner")     { population.tanners -= 1; } 
					else if (target == "blacksmith") { population.blacksmiths -= 1; } 
					else if (target == "healer")     { population.healers -= 1; } 
					else if (target == "cleric")     { population.clerics -= 1; } 
					else if (target == "labourer")   { population.labourers -= 1; } 
					else if (target == "soldier"){
						population.soldiers -= 1;
						population.soldiersCas -= 1;
						if (population.soldiersCas < 0){
							population.soldiers = 0;
							population.soldiersCas = 0;
						}
					} else if (target == "cavalry"){
						population.cavalry -= 1;
						population.cavalryCas -= 1;
						if (population.cavalryCas < 0){
							population.cavalry = 0;
							population.cavalryCas = 0;
						}
					}
					corpses.total += 1; //Unlike wolves, Barbarians leave corpses behind
					updatePopulation();
				} else {
					leaving = Math.ceil(population.barbarians * Math.random() * (1/3));
					population.barbarians -= leaving;
					population.barbariansCas -= leaving;
					updateMobs();
				}
			} else if (havoc < 0.6){
				//Steal shit, see bandits
				target = stealable[Math.floor(Math.random() * stealable.length)];
				stolenQty = Math.floor((Math.random() * 1000)); //Steal up to 1000.
				stolenQty = Math.min(stolenQty, target.total);
				if (stolenQty > 0) { gameLog('Barbarians stole ' + stolenQty + ' ' + target.name); }
				target.total -= stolenQty;
				if (target.total <= 0){
					//some will leave
					leaving = Math.ceil(population.barbarians * Math.random() * (1/24));
					population.barbarians -= leaving;
					population.barbariansCas -= leaving;
					updateMobs();
				}
				population.barbarians -= 1; //Barbarians leave after stealing something.
				population.barbariansCas -= 1;
				if (population.barbariansCas < 0) { population.barbariansCas = 0; }
				updateResourceTotals();
				updatePopulation();
			} else {
				//Destroy buildings
				num = Math.random(); //Barbarians attempt to destroy random buildings (and leave if they do)
				var destroyPhrase = 'destroyed a';
				if      (num <  1/16) { target = tent; } 
				else if (num <  2/16) { target = whut; } 
				else if (num <  3/16) { target = cottage; } 
				else if (num <  4/16) { target = house; } 
				else if (num <  5/16) { target = mansion; } 
				else if (num <  6/16) { target = barn; } 
				else if (num <  7/16) { target = woodstock; } 
				else if (num <  8/16) { target = stonestock; } 
				else if (num <  9/16) { target = tannery; } 
				else if (num < 10/16) { target = smithy; } 
				else if (num < 11/16) { target = apothecary; destroyPhrase = 'destroyed an'; } 
				else if (num < 12/16) { target = temple; } 
				else if (num < 13/16) { target = fortification; destroyPhrase = 'damaged'; } 
				else if (num < 14/16) { target = stable; } 
				else if (num < 15/16) { target = mill; } 
				else                  { target = barracks; }

				if (target.total > 0){
					target.total -= 1;
					gameLog('Barbarians ' + destroyPhrase + ' ' + target.name);
				} else {
					//some will leave
					leaving = Math.ceil(population.barbarians * Math.random() * (1/112));
					population.barbarians -= leaving;
					population.barbariansCas -= leaving;
					updateMobs();
				}

				population.barbarians -= 1;
				population.barbariansCas -= 1;
				if (population.barbarians < 0) { population.barbarians = 0; }
				if (population.barbariansCas < 0) { population.barbariansCas = 0; }
				updateResourceTotals();
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
				updateResourceTotals();
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
					corpses.total += (casFloor + mobCasFloor);
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
					corpses.total += (casFloor + mobCasFloor);
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

	doHealers();

	if (corpses.total > 0){
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
		updateResourceTotals();
	}
	
	if (graceCost > 1000) {
		graceCost -= 1;
		graceCost = Math.floor(graceCost);
		document.getElementById('graceCost').innerHTML = prettify(graceCost);
	}
	
	if (walkTotal > 0){
		if (population.healthy > 0){
			for (i=0;i<walkTotal;i++){
				target = randomHealthyWorker();
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
				} else if (target == "healer"){
					population.current -= 1;
					population.healers -= 1;
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
	updateTargets();
	updateSpawnButtons();
	updateReset();
	
	//Debugging - mark end of main loop and calculate delta in milliseconds
	//var end = new Date().getTime();
	//var time = end - start;
	//console.log('Main loop execution time: ' + time + 'ms');
	
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

	updateResourceTotals();
}

function toggleWorksafe(){
	var i;
	var elems;

	worksafe = !worksafe;
	body.classList.toggle("hasBackground");
	if (!usingWords)
	{
		elems = document.getElementsByClassName('icon');
		for(i = 0; i < elems.length; i++) {
			elems[i].style.visibility = worksafe ? 'hidden' : 'visible';
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
	gold.total += 10000;
	updatePopulation();
	updateUpgrades();
	updateResourceTotals();
}

/*
 * If you're reading this, thanks for playing!
 * This project was my first major HTML5/Javascript game, and was as
 * much about learning Javascript as it is anything else. I hope it
 * inspires others to make better games. :)
 *
 *     David Holley
 */
