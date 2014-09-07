"use strict";
/*jslint browser: true, devel: true, passfail: false, continue: true, eqeq: true, plusplus: true, vars: true, white: true, indent: 4, maxerr: 999 */
/* jshint laxbreak: true, laxcomma: true */
/* global updateJobButtons,updatePurchaseRow,updateResourceTotals,updateBuildingTotals,updateMobs,updateDeity,updateUpgrades,updateOldDeities,updateDevotion,updateParty,updateHappiness,updateWonder,updatePopulation,calcCost,updateJobs,updateAchievements,updateTargets,updateWonderList,digGraves,renameDeity,spawnMob,renameWonder,mood,versionAlert,gameLog,prettify,LZString,bake_cookie,read_cookie,prettify,updateRequirements,calcWorkerCost,mergeObj,isValid,setElemDisplay,rndRound,calcCombatMods,dataset,copyProps,updatePopulationUI,calcZombieCost,logSearchFn,getCustomNumber,calcArithSum,SecurityError,doSlaughter,doLoot,doHavoc,valOf,setAutosave,setCustomQuantities,textSize,setDelimiters,setShadow,setNotes,setWorksafe,setIcons,deleteCookie,matchType,addPUpgradeRows */
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


var version = 19; // This is an ordinal used to trigger reloads.
function VersionData(major,minor,sub,mod) {
    this.major = major;
    this.minor = minor;
    this.sub = sub;
    this.mod = mod;
}
VersionData.prototype.toNumber = function() { return this.major*1000 + this.minor + this.sub/1000; };
VersionData.prototype.toString = function() { return String(this.major) + "." 
    + String(this.minor) + "." + String(this.sub) + String(this.mod); };

var versionData = new VersionData(1,1,53,"alpha");

var saveTag = "civ";
var saveTag2 = saveTag + "2"; // For old saves.
var saveSettingsTag = "civSettings";
var logRepeat = 1;


// Civ size category minimums
var civSizes = [];
//xxx Maybe rework this so that (e.g.) civSizes.thorp is actually an alias for
//the thorp entry, rather than its index?
civSizes.thorp       = civSizes.length; civSizes[civSizes.thorp      ] = { min_pop :      0, name : "Thorp"       , id : "thorp"      };
civSizes.hamlet      = civSizes.length; civSizes[civSizes.hamlet     ] = { min_pop :     20, name : "Hamlet"      , id : "hamlet"     };
civSizes.village     = civSizes.length; civSizes[civSizes.village    ] = { min_pop :     60, name : "Village"     , id : "village"    };
civSizes.smallTown   = civSizes.length; civSizes[civSizes.smallTown  ] = { min_pop :    200, name : "Small Town"  , id : "smallTown"  };
civSizes.largeTown   = civSizes.length; civSizes[civSizes.largeTown  ] = { min_pop :   2000, name : "Large Town"  , id : "largeTown"  };
civSizes.smallCity   = civSizes.length; civSizes[civSizes.smallCity  ] = { min_pop :   5000, name : "Small City"  , id : "smallCity"  };
civSizes.largeCity   = civSizes.length; civSizes[civSizes.largeCity  ] = { min_pop :  10000, name : "Large City"  , id : "largeCity"  };
civSizes.metropolis  = civSizes.length; civSizes[civSizes.metropolis ] = { min_pop :  20000, name:"Metro&shy;polis",id : "metropolis" };
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
civSizes.getMaxPop = function(civTypeId) {
    if ((civSizes[civTypeId] + 1) < civSizes.length)
    {    
        return civSizes[civSizes[civTypeId] + 1].min_pop - 1;
    }
    return -1;
};

// Declare variables here so they can be referenced later.  
var curCiv = {
    civName : "Woodstock",
    rulerName : "Orteil",

    cat: { owned:0 },
    zombie: { owned:0 },
    grave: { owned:0 },
    enemySlain: { owned:0 },

    resourceClicks : 0, // For NeverClick
    attackCounter : 0, // How long since last attack?
    tradeCounter : 0, // How long since last trader?
    throneCount : 0, // Partial temples from Throne
    pestTimer : 0, // Pest hunting time left
    gloryTimer : 0, // Glory time left
    cureCounter : 0, // Carryover fractional healing
    graceCost : 1000, // Increasing cost to use Grace to increase morale.
    walkTotal : 0, // Sacrifice rate

    wonders : [], // array of { type, name }

    // Known deities.  The 0th element is the current game's deity.
    // If the name is "", no deity has been created (can also check for worship upgrade)
    // If the name is populated but the domain is not, the domain has not been selected.
    deities : [ { name:"", domain:"", maxDev:0 } ]  // array of { name, domain, maxDev }
};

function getCurDeityDomain() { return (curCiv.deities.length > 0) ? curCiv.deities[0].domain : undefined; }

var wonder;
var efficiency;
var raiding;

// These are not saved, but we need them up here for the asset data to init properly.
var population = {
    current:0,
    cap:0,
    healthy:0,
    totalSick:0
};

var civData; //xxx Should this be deleted?

//xxxTODO: Create a mechanism to automate the creation of a class hierarchy,
// specifying base class, shared props, instance props.
function CivObj(props, asProto)
{
    if (!(this instanceof CivObj)) { return new CivObj(props); } // Prevent accidental namespace pollution
    //xxx Should these just be taken off the prototype's property names?
    var names = asProto ? null : ["id","name","subType","owned","prereqs","require","salable","vulnerable","effectText"
                                 ,"prestige","initOwned","init","reset","limit","hasVariableCost"];
    Object.call(this,props);
    copyProps(this,props,names,true);
    return this;
}

// Common Properties: id, name, owned, prereqs, require, effectText,
//xxx TODO: Add save/load methods.
CivObj.prototype = {
    constructor: CivObj,
    subType: "normal",
    get owned() { return curCiv[this.id].owned; },
    set owned(value) { curCiv[this.id].owned = value; },
    prereqs: {},
    require: {},
    salable: false,
    vulnerable: true,
    effectText: "",
    prestige: false,
    initOwned: 0,  // Override this to undefined to inhibit initialization.  Also sets the type of the 'owned' property.
    init: function() { if (this.initOwned !== undefined) { curCiv[this.id] = {}; this.owned = this.initOwned; }; return true; },
    reset: function() { return (this.prestige) ? true : this.init(); }, // Default reset behavior is to re-init non-prestige items.
    get limit() { return (typeof this.initOwned == "number" ) ? Infinity // Default is no limit for numbers
                       : (typeof this.initOwned == "boolean") ? true : 0; }, // true (1) for booleans, 0 otherwise.
    set limit(value) { return this.limit; }, // Only here for JSLint.
    //xxx This is a hack; it assumes that any CivObj with a getter for its
    // 'require' has a variable cost.  Which is currently true, but might not
    // always be.
    hasVariableCost: function() { 
        var i;
        // If our requirements have a getter, assume variable.
        //xxx This won't work if it inherits a variable desc.
        var requireDesc = Object.getOwnPropertyDescriptor(this,"require");
        if (!requireDesc) { return false; } // Unpurchaseable
        if (requireDesc.get !== undefined) { return true; }
        // If our requirements contain a function, assume variable.
        for(i in this.require) { if (typeof this.require[i] == "function") { return true; } }
        return false;
    }
};

function Resource(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Resource)) { return new Resource(props); } // Prevent accidental namespace pollution
    CivObj.call(this,props);
    copyProps(this,props,null,true);
    // Occasional Properties: increment, specialChance, net
    return this;
}
Resource.prototype = new CivObj({
    constructor: Resource,
    type: "resource",
    // 'net' accessor always exists, even if the underlying value is undefined for most resources.
    get net() { return curCiv[this.id].net; },
    set net(value) { curCiv[this.id].net = value; },
    increment: 0,
    specialChance: 0,
    specialMaterial: "",
    activity: "gathering" //I18N
},true);

function Building(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Building)) { return new Building(props); } // Prevent accidental namespace pollution
    CivObj.call(this,props);
    copyProps(this,props,null,true);
    // Occasional Properties: subType, efficiency, devotion
    // plural should get moved during I18N.
    return this;
}
// Common Properties: type="building",customQtyId
Building.prototype = new CivObj({
    constructor: Building,
    type: "building",
    get vulnerable() { return this.subType != "altar"; }, // Altars can't be sacked.
    set vulnerable(value) { return this.vulnerable; }, // Only here for JSLint.
    customQtyId: "buildingCustomQty"
},true);

function Upgrade(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Upgrade)) { return new Upgrade(props); } // Prevent accidental namespace pollution
    CivObj.call(this,props);
    copyProps(this,props,null,true);
    // Occasional Properties: subType, efficiency, extraText, onGain
    if (this.subType == "prayer") { this.initOwned = undefined; } // Prayers don't get initial values.
    if (this.subType == "pantheon") { this.prestige = true; } // Pantheon upgrades are not lost on reset.
    return this;
}
// Common Properties: type="upgrade"
Upgrade.prototype = new CivObj({
    constructor: Upgrade,
    type: "upgrade",
    initOwned: false,
    vulnerable: false,
    get limit() { return 1; }, // Can't re-buy these.
    set limit(value) { return this.limit; } // Only here for JSLint.
},true);

function Unit(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Unit)) { return new Unit(props); } // Prevent accidental namespace pollution
    CivObj.call(this,props);
    copyProps(this,props,null,true);
    // Occasional Properties: singular, plural, subType, prereqs, require, effectText, alignment,
    // source, efficiency_base, efficiency, onWin, lootFatigue, killFatigue, killExhaustion, species
    // location, ill
    return this;
}
// Common Properties: type="unit"
Unit.prototype = new CivObj({
    constructor: Unit,
    type: "unit",
    salable: true,
    get customQtyId() { return this.location + "CustomQty"; },
    set customQtyId(value) { return this.customQtyId; }, // Only here for JSLint.
    alignment:"player", // Also: "enemy"
    species: "human", // Also:  "animal", "mechanical", "undead"
    location: "home", // Also:  "party"
    get vulnerable() { return ((this.location == "home")&&(this.alignment=="player")&&(this.subType=="normal")); },
    set vulnerable(value) { return this.vulnerable; }, // Only here for JSLint.
    init: function() { if (this.initOwned === undefined) { return false; }
        curCiv[this.id] = {}; 
        this.owned = this.initOwned; 
        // Right now, only vulnerable human units can get sick.
        if (this.vulnerable() && (this.species=="human")) {
            this.illObj = { owned: 0 };
        }; 
        return true; 
    },
    //xxx Right now, ill numbers are being stored as a separate structure inside curCiv.
    // It would probably be better to make it an actual 'ill' property of the Unit.
    // That will require migration code.
    get illObj() { return curCiv[this.id+"Ill"]; },
    set illObj(value) { curCiv[this.id+"Ill"] = value; }, 
    get ill() { return isValid(this.illObj) ? this.illObj.owned : undefined; },
    set ill(value) { if (isValid(this.illObj)) { this.illObj.owned = value; } },
    get partyObj() { return civData[this.id+"Party"]; },
    set partyObj(value) { return this.partyObj; }, // Only here for JSLint.
    get party() { return isValid(this.partyObj) ? this.partyObj.owned : undefined; },
    set party(value) { if (isValid(this.partyObj)) { this.partyObj.owned = value; } },
    // Is this unit just some other sort of unit in a different location (but in the same limit pool)?
    isDest: function() { return (this.source !== undefined) && (civData[this.source].partyObj === this); },
    get limit() { return (this.isDest()) ? civData[this.source].limit 
                                             : Object.getOwnPropertyDescriptor(CivObj.prototype,"limit").get.call(this); },
    set limit(value) { return this.limit; }, // Only here for JSLint.

    // The total quantity of this unit, regardless of status or location.
    get total() { return (this.isDest()) ? civData[this.source].total : (this.owned + (this.ill||0) + (this.party||0)); },
    set total(value) { return this.total; } // Only here for JSLint.
},true);

function Achievement(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Achievement)) { return new Achievement(props); } // Prevent accidental namespace pollution
    CivObj.call(this,props);
    copyProps(this,props,null,true);
    // Occasional Properties: test
    return this;
}
// Common Properties: type="achievement"
Achievement.prototype = new CivObj({
    constructor: Achievement,
    type: "achievement",
    initOwned: false,
    prestige : true, // Achievements are not lost on reset.
    vulnerable : false,
    get limit() { return 1; }, // Can't re-buy these.
    set limit(value) { return this.limit; } // Only here for JSLint.
},true);

// Initialize Data
var civData = [
// Resources
new Resource({ id:"food", name:"food", increment:1, specialChance:0.1,
    specialMaterial: "skins", activity: "foraging", //I18N
    get limit() { return 200 + (curCiv.barn.owned * (civData.granaries.owned?2:1) * 200); },
    set limit(value) { return this.limit; } // Only here for JSLint.
}),
new Resource({ id:"wood", name:"wood", increment:1, specialChance:0.1,
    specialMaterial: "herbs", activity: "woodcutting", //I18N
    get limit() { return 200 + (curCiv.woodstock.owned  * 200); },
    set limit(value) { return this.limit; } // Only here for JSLint.
}),
new Resource({ id:"stone", name:"stone", increment:1, specialChance:0.1,
    specialMaterial: "ore", activity: "mining", //I18N
    get limit() { return 200 + (curCiv.stonestock.owned  * 200); },
    set limit(value) { return this.limit; } // Only here for JSLint.
}),
new Resource({ id:"skins", name:"skins" }),
new Resource({ id:"herbs", name:"herbs" }),
new Resource({ id:"ore", name:"ore" }),
new Resource({ id:"leather", name:"leather" }),
new Resource({ id:"metal", name:"metal" }),
new Resource({ id:"piety", name:"piety", vulnerable:false }), // Can't be stolen
new Resource({ id:"gold", name:"gold", vulnerable:false }), // Can't be stolen
new Resource({ id:"corpses", name:"corpses", vulnerable:false }), // Can't be stolen
new Resource({ id:"devotion", name:"devotion", vulnerable:false }), // Can't be stolen
// Buildings
new Building({ id:"freeLand", name:"free land", plural:"free land", 
    prereqs: undefined,  // Cannot be purchased.
    require: undefined,  // Cannot be purchased.
    vulnerable:false, 
    initOwned:1000,  // Can't be stolen
    effectText:"Remaining room to expand" }),
new Building({ id:"tent", name:"tent", plural:"tents",
    require: { wood:2, skins:2 },
    effectText:"+1 max pop." }),
new Building({ id:"hut", name:"wooden hut", plural:"wooden huts",
    require : { wood:20, skins:1 },
    effectText:"+3 max pop." }),
new Building({ id:"cottage", name:"cottage", plural:"cottages",
    prereqs:{ masonry: true },
    require:{ wood:10, stone:30 },
    effectText:"+6 max pop." }),
new Building({ id:"house", name:"house", plural:"houses",
    prereqs:{ construction: true },
    require:{ wood:30, stone:70 },
    get effectText() { var num = 10 + 2*(civData.slums.owned + civData.tenements.owned); return "+"+num+" max pop."; },
    set effectText(value) { return this.require; }, // Only here for JSLint.
    update: function() { document.getElementById(this.id+"Note").innerHTML = ": "+this.effectText; } }),
new Building({ id:"mansion", name:"mansion", plural:"mansions",
    prereqs:{ architecture: true },
    require:{ wood:200, stone:200, leather:20 },
    effectText:"+50 max pop." }),
new Building({ id:"barn", name:"barn", plural:"barns",
    require:{ wood:100 },
    effectText:"+200 food storage" }),
new Building({ id:"woodstock", name:"wood stockpile", plural:"wood stockpiles",
    require:{ wood:100 },
    effectText:"+200 wood storage" }),
new Building({ id:"stonestock", name:"stone stockpile", plural:"stone stockpiles",
    require:{ wood:100 },
    effectText:"+200 stone storage" }),
new Building({ id:"tannery", name:"tannery", plural:"tanneries",
    prereqs:{ masonry: true },
    require:{ wood:30, stone:70, skins:2 },
    effectText:"allows 1 tanner" }),
new Building({ id:"smithy", name:"smithy", plural:"smithies",
    prereqs:{ masonry: true },
    require:{ wood:30, stone:70, ore:2 },
    effectText:"allows 1 blacksmith" }),
new Building({ id:"apothecary", name:"apothecary", plural:"apothecaries",
    prereqs:{ masonry: true },
    require:{ wood:30, stone:70, herbs:2 },
    effectText:"allows 1 healer" }),
new Building({ id:"temple", name:"temple", plural:"temples",
    prereqs:{ masonry: true },
    require:{ wood:30, stone:120 },
    effectText:"allows 1 cleric",
    //if purchase was a temple and aesthetics has been activated, increase happiness
    //if population is large, temples have less effect.
    onGain: function(num) { if (civData.aesthetics && civData.aesthetics.owned && num) { mood(num * 25 / population.current); } }}),
new Building({ id:"barracks", name:"barracks", plural:"barracks",
    prereqs:{ masonry: true },
    require:{ food:20, wood:60, stone:120, metal:10 },
    effectText:"allows 10 soldiers" }),
new Building({ id:"stable", name:"stable", plural:"stables",
    prereqs:{ horseback: true },
    require:{ food:60, wood:60, stone:120, leather:10 },
    effectText:"allows 10 cavalry" }),
new Building({ id:"graveyard", name:"graveyard", plural:"graveyards",
    prereqs:{ masonry: true },
    require:{ wood:50, stone:200, herbs:50 },
    vulnerable: false, // Graveyards can't be sacked
    effectText:"contains 100 graves",
    onGain: function(num) { if (num === undefined) { num = 1; } digGraves(num); }}),
new Building({ id:"mill", name:"mill", plural:"mills",
    prereqs:{ wheel: true },
    get require() { return { wood  : 100 * (this.owned + 1) * Math.pow(1.05,this.owned),
                             stone : 100 * (this.owned + 1) * Math.pow(1.05,this.owned) }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"improves farmers" }),
new Building({ id:"fortification", name:"fortification", plural:"fortifications", efficiency: 0.01,
    prereqs:{ architecture: true },
    //xxx This is testing a new technique that allows a function for the cost items.
    // Eventually, this will take a qty parameter
    get require() { return { stone : function() { return 100 * (this.owned + 1) * Math.pow(1.05,this.owned); }.bind(this) }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"helps protect against attack" }),
// Altars
// The 'name' on the altars is really the label on the button to make them.
//xxx This should probably change.
new Building({ id:"battleAltar", name:"Build Altar", plural:"battle altars", subType: "altar", devotion:1,
    prereqs:{ deity: "battle" },
    get require() { return { stone:200, piety:200, metal : 50 + (50 * this.owned) }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"+1 Devotion" }),
new Building({ id:"fieldsAltar", name:"Build Altar", plural:"fields altars", subType: "altar", devotion:1,
    prereqs:{ deity: "fields" },
    get require() { return { stone:200, piety:200,
            food : 500 + (250 * this.owned), wood : 500 + (250 * this.owned) }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"+1 Devotion" }),
new Building({ id:"underworldAltar", name:"Build Altar", plural:"underworld altars", subType: "altar", devotion:1,
    prereqs:{ deity: "underworld" },
    get require() { return { stone:200, piety:200, corpses : 1 + this.owned }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"+1 Devotion" }),
new Building({ id:"catAltar", name:"Build Altar", plural:"cat altars", subType: "altar", devotion:1,
    prereqs:{ deity: "cats" },
    get require() { return { stone:200, piety:200, herbs : 100 + (50 * this.owned) }; },
    set require(value) { return this.require; }, // Only here for JSLint.
    effectText:"+1 Devotion" }),
// Upgrades
new Upgrade({ id:"skinning", name:"Skinning", subType: "upgrade",
    require: { skins: 10 },
    effectText:"Farmers can collect skins" }),
new Upgrade({ id:"harvesting", name:"Harvesting", subType: "upgrade",
    require: { herbs: 10 },
    effectText:"Woodcutters can collect herbs" }),
new Upgrade({ id:"prospecting", name:"Prospecting", subType: "upgrade",
    require: { ore: 10 },
    effectText:"Miners can collect ore" }),
new Upgrade({ id:"domestication", name:"Domestication", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { leather: 20 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"ploughshares", name:"Ploughshares", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { metal:20 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"irrigation", name:"Irrigation", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 500, stone: 200 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"butchering", name:"Butchering", subType: "upgrade",
    prereqs:{ construction: true, skinning: true },
    require: { leather: 40 },
    effectText:"More farmers collect more skins" }),
new Upgrade({ id:"gardening", name:"Gardening", subType: "upgrade",
    prereqs:{ construction: true, harvesting: true },
    require: { herbs: 40 },
    effectText:"More woodcutters collect more herbs" }),
new Upgrade({ id:"extraction", name:"Extraction", subType: "upgrade",
    prereqs:{ construction: true, prospecting: true },
    require: { metal: 40 },
    effectText:"More miners collect more ore" }),
new Upgrade({ id:"flensing", name:"Flensing", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { metal: 1000 },
    effectText:"Collect skins more frequently" }),
new Upgrade({ id:"macerating", name:"Macerating", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { leather: 500, stone: 500 },
    effectText:"Collect ore more frequently" }),
new Upgrade({ id:"croprotation", name:"Crop Rotation", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { herbs: 5000, piety: 1000 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"selectivebreeding", name:"Selective Breeding", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { skins: 5000, piety: 1000 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"fertilisers", name:"Fertilisers", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { ore: 5000, piety: 1000 },
    effectText:"Increase farmer food output" }),
new Upgrade({ id:"masonry", name:"Masonry", subType: "upgrade",
    require: { wood: 100, stone: 100 },
    effectText:"Unlock more buildings and upgrades" }),
new Upgrade({ id:"construction", name:"Construction", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 1000, stone: 1000 },
    effectText:"Unlock more buildings and upgrades" }),
new Upgrade({ id:"architecture", name:"Architecture", subType: "upgrade",
    prereqs:{ construction: true },
    require: { wood: 10000, stone: 10000 },
    effectText:"Unlock more buildings and upgrades" }),
new Upgrade({ id:"tenements", name:"Tenements", subType: "upgrade",
    prereqs:{ construction: true },
    require: { food: 200, wood: 500, stone: 500 },
    effectText:"Houses support +2 workers",
    onGain: function() { updatePopulationUI(); } //due to population limits changing
}),
new Upgrade({ id:"slums", name:"Slums", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { food: 500, wood: 1000, stone: 1000 },
    effectText:"Houses support +2 workers",
    onGain: function() { updatePopulationUI(); } //due to population limits changing
}),
new Upgrade({ id:"granaries", name:"Granaries", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 1000, stone: 1000 },
    effectText:"Barns store double the amount of food",
    onGain: function() { updateResourceTotals(); } //due to resource limits increasing
}),
new Upgrade({ id:"palisade", name:"Palisade", subType: "upgrade",
    efficiency: 0.01, // Subtracted from attacker efficiency.
    prereqs:{ construction: true },
    require: { wood: 2000, stone: 1000 },
    effectText:"Enemies do less damage" }),
new Upgrade({ id:"weaponry", name:"Basic Weaponry", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 500, metal: 500 },
    effectText:"Improve soldiers" }),
new Upgrade({ id:"shields", name:"Basic Shields", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 500, leather: 500 },
    effectText:"Improve soldiers" }),
new Upgrade({ id:"horseback", name:"Horseback Riding", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { food: 500, wood: 500 },
    effectText:"Build stables" }),
new Upgrade({ id:"wheel", name:"The Wheel", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { wood: 500, stone: 500 },
    effectText:"Build mills" }),
new Upgrade({ id:"writing", name:"Writing", subType: "upgrade",
    prereqs:{ masonry: true },
    require: { skins: 500 },
    effectText:"Increase cleric piety generation" }),
new Upgrade({ id:"administration", name:"Administration", subType: "upgrade",
    prereqs:{ writing: true },
    require: { stone: 1000, skins: 1000 },
    effectText:"Increase land gained from raiding" }),
new Upgrade({ id:"codeoflaws", name:"Code of Laws", subType: "upgrade",
    prereqs:{ writing: true },
    require: { stone: 1000, skins: 1000 },
    effectText:"Reduce unhappiness caused by overcrowding" }),
new Upgrade({ id:"mathematics", name:"Mathematics", subType: "upgrade",
    prereqs:{ writing: true },
    require: { herbs: 1000, piety: 1000 },
    effectText:"Create siege engines" }),
new Upgrade({ id:"aesthetics", name:"Aesthetics", subType: "upgrade",
    prereqs:{ writing: true },
    require: { piety: 5000 },
    effectText:"Building temples increases happiness" }),
new Upgrade({ id:"civilservice", name:"Civil Service", subType: "upgrade",
    prereqs:{ architecture: true },
    require: { piety: 5000 },
    effectText:"Increase basic resources from clicking" }),
new Upgrade({ id:"feudalism", name:"Feudalism", subType: "upgrade",
    prereqs:{ civilservice: true },
    require: { piety: 10000 },
    effectText:"Further increase basic resources from clicking" }),
new Upgrade({ id:"guilds", name:"Guilds", subType: "upgrade",
    prereqs:{ civilservice: true },
    require: { piety: 10000 },
    effectText:"Increase special resources from clicking" }),
new Upgrade({ id:"serfs", name:"Serfs", subType: "upgrade",
    prereqs:{ civilservice: true },
    require: { piety: 20000 },
    effectText:"Idle workers increase resources from clicking" }),
new Upgrade({ id:"nationalism", name:"Nationalism", subType: "upgrade",
    prereqs:{ civilservice: true },
    require: { piety: 50000 },
    effectText:"Soldiers increase basic resources from clicking" }),
new Upgrade({ id:"worship", name:"Worship", subType: "deity",
    prereqs:{ temple: 1 },
    require: { piety: 1000 },
    effectText:"Begin worshipping a deity (requires temple)",
    onGain: function() {
        updateUpgrades();
        renameDeity(); //Need to add in some handling for when this returns NULL.
    } }),
// Pantheon Upgrades
new Upgrade({ id:"lure", name:"Lure of Civilisation", subType: "pantheon",
    prereqs:{ deity: "cats", devotion: 10 },
    require: { piety: 1000 },
    effectText:"increase chance to get cats" }),
new Upgrade({ id:"companion", name:"Warmth of the Companion", subType: "pantheon",
    prereqs:{ deity: "cats", devotion: 30 },
    require: { piety: 1000 },
    effectText:"cats help heal the sick" }),
new Upgrade({ id:"comfort", name:"Comfort of the Hearthfires", subType: "pantheon",
    prereqs:{ deity: "cats", devotion: 50 },
    require: { piety: 5000 },
    effectText:"traders marginally more frequent" }),
new Upgrade({ id:"blessing", name:"Blessing of Abundance", subType: "pantheon",
    prereqs:{ deity: "fields", devotion: 10 },
    require: { piety: 1000 },
    effectText:"increase farmer food output" }),
new Upgrade({ id:"waste", name:"Abide No Waste", subType: "pantheon",
    prereqs:{ deity: "fields", devotion: 30 },
    require: { piety: 1000 },
    effectText:"workers will eat corpses if there is no food left" }),
new Upgrade({ id:"stay", name:"Stay With Us", subType: "pantheon",
    prereqs:{ deity: "fields", devotion: 50 },
    require: { piety: 5000 },
    effectText:"traders stay longer" }),
new Upgrade({ id:"riddle", name:"Riddle of Steel", subType: "pantheon",
    prereqs:{ deity: "battle", devotion: 10 },
    require: { piety: 1000 },
    effectText:"improve soldiers" }),
new Upgrade({ id:"throne", name:"Throne of Skulls", subType: "pantheon",
    prereqs:{ deity: "battle", devotion: 30 },
    require: { piety: 1000 },
    effectText:"slaying enemies creates temples" }),
new Upgrade({ id:"lament", name:"Lament of the Defeated", subType: "pantheon",
    prereqs:{ deity: "battle", devotion: 50 },
    require: { piety: 5000 },
    effectText:"Successful raids delay future invasions" }),
new Upgrade({ id:"book", name:"The Book of the Dead", subType: "pantheon",
    prereqs:{ deity: "underworld", devotion: 10 },
    require: { piety: 1000 },
    effectText:"gain piety with deaths" }),
new Upgrade({ id:"feast", name:"A Feast for Crows", subType: "pantheon",
    prereqs:{ deity: "underworld", devotion: 30 },
    require: { piety: 1000 },
    effectText:"corpses are less likely to cause illness" }),
new Upgrade({ id:"secrets", name:"Secrets of the Tombs", subType: "pantheon",
    prereqs:{ deity: "underworld", devotion: 50 },
    require: { piety: 5000 },
    effectText:"graveyards increase cleric piety generation" }),
// Special Upgrades
new Upgrade({ id:"standard", name:"Battle Standard", subType: "conquest",
    prereqs:{ barracks: 1 },
    require: { leather: 1000, metal: 1000 },
    effectText:"Lets you build an army (requires barracks)" }),
new Upgrade({ id:"trade", name:"Trade", subType: "trade",
    prereqs: { gold: 1 }, 
    require: { gold: 1 }, 
    effectText:"Open the trading post" }),
new Upgrade({ id:"currency", name:"Currency", subType: "trade",
    require: { ore: 1000, gold: 10 }, 
    effectText:"Traders arrive more frequently, stay longer" }),
new Upgrade({ id:"commerce", name:"Commerce", subType: "trade",
    require: { piety: 10000, gold: 100 }, 
    effectText:"Traders arrive more frequently, stay longer" }),
// Prayers
new Upgrade({ id:"smite", name:"Smite Invaders", subType: "prayer",
    prereqs:{ deity: "battle", devotion: 20 },
    require: { piety: 100 },
    effectText:"(per invader killed)" }),
new Upgrade({ id:"glory", name:"For Glory!", subType: "prayer",
    prereqs:{ deity: "battle", devotion: 40 },
    require: { piety: 1000 }, 
    effectText:"Temporarily makes raids more difficult, increases rewards" }),
new Upgrade({ id:"wickerman", name:"Burn Wicker Man", subType: "prayer",
    prereqs:{ deity: "fields", devotion: 20 },
    require: { wood: 500 },  //xxx +1 Worker
    effectText:"Sacrifice 1 worker to gain a random bonus to a resource" }),
new Upgrade({ id:"walk", name:"Walk Behind the Rows", subType: "prayer",
    prereqs:{ deity: "fields", devotion: 40 },
    require: { }, //xxx 1 Worker/sec
    effectText:"boost food production by sacrificing 1 worker/sec.",
    extraText: "<br /><button id='ceaseWalk' onmousedown='walk(false)' disabled='disabled'>Cease Walking</button>" }),
new Upgrade({ id:"raiseDead", name:"Raise Dead", subType: "prayer",
    prereqs:{ deity: "underworld", devotion: 20 },
    require: { corpses: 1, piety: 4 }, //xxx Nonlinear cost
    effectText:"Piety to raise the next zombie",
    extraText:"<button onmousedown='raiseDead(100)' id='raiseDead100' class='x100' disabled='disabled'>x100</button><button onmousedown='raiseDead(Infinity)' id='raiseDeadMax' class='x100' disabled='disabled'>Max</button>" }),
new Upgrade({ id:"summonShade", name:"Summon Shades", subType: "prayer",
    prereqs:{ deity: "underworld", devotion: 40 },
    require: { piety: 1000 },  //xxx Also need slainEnemies
    effectText:"Souls of the defeated rise to fight for you" }),
new Upgrade({ id:"pestControl", name:"Pest Control", subType: "prayer",
    prereqs:{ deity: "cats", devotion: 20 },
    require: { piety: 100 }, 
    effectText:"Give temporary boost to food production" }),
new Upgrade({ id:"grace", name:"Grace", subType: "prayer",
    prereqs:{ deity: "cats", devotion: 40 },
    require: { piety: 1000 }, //xxx This is not fixed; see curCiv.graceCost
    effectText:"Increase Happiness" }),
// Units
new Unit({ id:"totalSick", name:"sick worker", singular:"sick worker", plural:"sick workers", subType:"special",
    prereqs: undefined,  // Hide until we get one.
    require: undefined,  // Cannot be purchased.
    salable: false,  // Cannot be sold.
    //xxx This (alternate data location) could probably be cleaner.
    get owned() { return population[this.id]; },
    set owned(value) { population[this.id]= value; },
    init: function() { this.owned = this.initOwned; },
    effectText:"Use healers and herbs to cure them" }),
new Unit({ id:"unemployed", name:"idle worker", singular:"idle worker", plural:"idle workers",
    require: undefined,  // Cannot be purchased (through normal controls) xxx Maybe change this?
    salable: false,  // Cannot be sold.
    customQtyId:"spawnCustomQty",
    effectText:"Playing idle games" }),
new Unit({ id:"farmer", name:"farmers", singular:"farmer", plural:"farmers",
    source:"unemployed",
    efficiency_base: 0.2,
    get efficiency() { return this.efficiency_base + (0.1 * (
    + civData.domestication.owned + civData.ploughshares.owned + civData.irrigation.owned 
    + civData.croprotation.owned + civData.selectivebreeding.owned + civData.fertilisers.owned 
    + civData.blessing.owned)); },
    set efficiency(value) { this.efficiency_base = value; },
    effectText:"Automatically gather food" }),
new Unit({ id:"woodcutter", name:"woodcutters", singular:"woodcutter", plural:"woodcutters",
    source:"unemployed",
    efficiency: 0.5,
    effectText:"Automatically gather wood" }),
new Unit({ id:"miner", name:"miners", singular:"miner", plural:"miners",
    source:"unemployed",
    efficiency: 0.2,
    effectText:"Automatically gather stone" }),
new Unit({ id:"tanner", name:"tanners", singular:"tanner", plural:"tanners",
    source:"unemployed",
    efficiency: 0.5,
    prereqs:{ tannery: 1 },
    get limit() { return civData.tannery.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Convert skins to leather" }),
new Unit({ id:"blacksmith", name:"blacksmiths", singular:"blacksmith", plural:"blacksmiths",
    source:"unemployed",
    efficiency: 0.5,
    prereqs:{ smithy: 1 },
    get limit() { return civData.smithy.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Convert ore to metal" }),
new Unit({ id:"healer", name:"healers", singular:"healer", plural:"healers",
    source:"unemployed",
    efficiency: 0.1,
    prereqs:{ apothecary: 1 },
    get limit() { return civData.apothecary.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Cure sick workers" }),
new Unit({ id:"cleric", name:"clerics", singular:"cleric", plural:"clerics",
    source:"unemployed",
    efficiency: 0.05,
    prereqs:{ temple: 1 },
    get limit() { return civData.temple.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Generate piety, bury corpses" }),
new Unit({ id:"labourer", name:"labourers", singular:"labourer", plural:"labourers",
    source:"unemployed",
    efficiency: 1.0,
    prereqs:{ wonder: "building" }, //xxx This is a hack
    effectText:"Use resources to build wonder" }),
new Unit({ id:"soldier", name:"soldiers", singular:"soldier", plural:"soldiers",
    source:"unemployed",
    efficiency_base: 0.05,
    get efficiency() { return this.efficiency_base + calcCombatMods(); },
    set efficiency(value) { this.efficiency_base = value; },
    prereqs:{ barracks: 1 },
    require:{ leather:10, metal:10 },
    get limit() { return 10*civData.barracks.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Protect from attack" }),
new Unit({ id:"cavalry", name:"cavalry", singular:"cavalry", plural:"cavalry",
    source:"unemployed",
    efficiency_base: 0.08,
    get efficiency() { return this.efficiency_base + calcCombatMods(); },
    set efficiency(value) { this.efficiency_base = value; },
    prereqs:{ stable: 1 },
    require:{ food:20, leather:20 },
    get limit() { return 10*civData.stable.owned; },
    set limit(value) { return this.limit; }, // Only here for JSLint.
    effectText:"Protect from attack" }),
new Unit({ id:"cat", name:"cats", singular:"cat", plural:"cats", subType:"special",
    require: undefined,  // Cannot be purchased (through normal controls)
    prereqs:{ cat: 1 }, // Only visible if you have one.
    prestige : true, // Not lost on reset.
    salable: false,  // Cannot be sold.
    species:"animal",
    effectText:"Our feline companions" }),
new Unit({ id:"shade", name:"shades", singular:"shade", plural:"shades", subType:"special",
    prereqs: undefined,  // Cannot be purchased (through normal controls) xxx Maybe change this?
    require: undefined,  // Cannot be purchased.
    salable: false,  // Cannot be sold.
    species:"undead",
    effectText:"Insubstantial spirits" }),
new Unit({ id:"wolf", name:"wolves", singular:"wolf", plural:"wolves",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.05,
    onWin: function() { doSlaughter(this); },
    killFatigue:(1.0), // Max fraction that leave after killing the last person
    killExhaustion:(1/2), // Chance of an attacker leaving after killing a person
    species:"animal",
    effectText:"Eat your workers" }),
new Unit({ id:"bandit", name:"bandits", singular:"bandit", plural:"bandits",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.07,
    onWin: function() { doLoot(this); },
    lootFatigue:(1/8), // Max fraction that leave after cleaning out a resource
    effectText:"Steal your resources" }),
new Unit({ id:"barbarian", name:"barbarians", singular:"barbarian", plural:"barbarians",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.09,
    onWin: function() { doHavoc(this); },
    lootFatigue:(1/24), // Max fraction that leave after cleaning out a resource
    killFatigue:(1/3), // Max fraction that leave after killing the last person
    killExhaustion:(1.0), // Chance of an attacker leaving after killing a person
    effectText:"Slaughter, plunder, and burn" }),
new Unit({ id:"esiege", name:"siege engines", singular:"Siege Engine", plural:"siege engines",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.1,  // 10% chance to hit
    species:"mechanical",
    effectText:"Destroy your fortifications" }),
new Unit({ id:"soldierParty", name:"soldiers", singular:"soldier", plural:"soldiers",
    source:"soldier",
    efficiency_base: 0.05,
    get efficiency() { return this.efficiency_base + calcCombatMods(); },
    set efficiency(value) { this.efficiency_base = value; },
    prereqs:{ standard: true, barracks: 1 },
    location: "party",
    effectText:"Your raiding party" }),
new Unit({ id:"cavalryParty", name:"cavalry", singular:"cavalry", plural:"cavalry",
    source:"cavalry",
    efficiency_base: 0.08,
    get efficiency() { return this.efficiency_base + calcCombatMods(); },
    set efficiency(value) { this.efficiency_base = value; },
    prereqs:{ standard: true, stable: 1 },
    location: "party",
    effectText:"Your mounted raiders" }),
new Unit({ id:"siege", name:"siege engines", singular:"Siege Engine", plural:"siege engines",
    efficiency: 0.1, // 10% chance to hit
    prereqs:{ standard: true, mathematics: true },
    require:{ wood:200, leather:50, metal:50 },
    species:"mechanical",
    location: "party",
    salable: false,
    effectText:"Destroy enemy fortifications" }),
new Unit({ id:"esoldier", name:"soldiers", singular:"soldier", plural:"soldiers",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.05,
    location: "party",
    effectText:"Defending enemy troops" }),
// Not currently used.
new Unit({ id:"ecavalry", name:"cavalry", singular:"cavalry", plural:"cavalry",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.08,
    location: "party" }),
new Unit({ id:"efort", name:"fortifications", singular:"fortification", plural:"fortifications",
    alignment:"enemy",
    prereqs: undefined, // Cannot be purchased.
    efficiency: 0.01, // -1% damage
    species:"mechanical",
    location: "party",
    effectText:"Reduce enemy casualties"}),
// Achievements
    //conquest
new Achievement({id:"raiderAch"        , name:"Raider"            , test:function() { return raiding.victory; }}),
    //xxx Technically this also gives credit for capturing a siege engine.
new Achievement({id:"engineerAch"    , name:"Engi&shy;neer"    , test:function() { return curCiv.siege.owned > 0; }}),
    // If we beat the largest possible opponent, grant bonus achievement.
new Achievement({id:"dominationAch"    , name:"Domi&shy;nation"    , test:function() { return raiding.victory && (raiding.last == civSizes[civSizes.length-1].id); }}),
    //happiness
new Achievement({id:"hatedAch"        , name:"Hated"            , test:function() { return efficiency.happiness <= 0.5; }}),
new Achievement({id:"lovedAch"        , name:"Loved"            , test:function() { return efficiency.happiness >= 1.5; }}),
    //cats
new Achievement({id:"catAch"        , name:"Cat!"            , test:function() { return curCiv.cat.owned >= 1; }}),
new Achievement({id:"glaringAch"    , name:"Glaring"            , test:function() { return curCiv.cat.owned >= 10; }}),
new Achievement({id:"clowderAch"    , name:"Clowder"            , test:function() { return curCiv.cat.owned >= 100; }}),
    //other population
    //Plagued achievement requires sick people to outnumber healthy
new Achievement({id:"plaguedAch"    , name:"Plagued"            , test:function() { return population.totalSick > population.healthy; }}),
new Achievement({id:"ghostTownAch"    , name:"Ghost Town"        , test:function() { return (population.current === 0) && (population.cap >= 1000); }}),
    //deities
    //xxx TODO: Should make this loop through the domains
new Achievement({id:"battleAch"        , name:"Battle"            , test:function() { return getCurDeityDomain() == "battle"; }}),
new Achievement({id:"fieldsAch"        , name:"Fields"            , test:function() { return getCurDeityDomain() == "fields"; }}),
new Achievement({id:"underworldAch"    , name:"Under&shy;world"    , test:function() { return getCurDeityDomain() == "underworld"; }}),
new Achievement({id:"catsAch"        , name:"Cats"            , test:function() { return getCurDeityDomain() == "cats"; }}),
new Achievement({id:"fullHouseAch"    , name:"Full House"        , test:function() { return curCiv.battleAch.owned && curCiv.fieldsAch.owned && curCiv.underworldAch.owned && curCiv.catsAch.owned; }}),
    //wonders
new Achievement({id:"wonderAch"        , name:"Wonder"            , test:function() { return wonder.completed; }}),
new Achievement({id:"sevenAch"        , name:"Seven!"            , test:function() { return wonder.food + wonder.wood + wonder.stone + wonder.skins 
                                                                        + wonder.herbs + wonder.ore + wonder.leather + wonder.metal 
                                                                        + wonder.piety >= 7; }}),
    //trading
new Achievement({id:"merchantAch"    , name:"Merch&shy;ant"    , test:function() { return curCiv.gold.owned > 0; }}),
new Achievement({id:"rushedAch"        , name:"Rushed"            , test:function() { return wonder.rushed; }}),
    //other
new Achievement({id:"neverclickAch"    , name:"Never&shy;click"    , test:function() { return wonder.completed && curCiv.resourceClicks <= 22; }})
];

function augmentCivData() {
    var i;
    var testCivSizeAch = function() { return (this.id == civSizes.getCivSize(population.current).id+"Ach"); };
    // Add the civ size based achivements to the front of the data, so that they come first.
    for (i=civSizes.length-1;i>0;--i) {
        civData.unshift(new Achievement({id:civSizes[i].id+"Ach", name:civSizes[i].name, test:testCivSizeAch}));
    }
    //xxx TODO: Add deity domain based achievements here too.
}
augmentCivData();

function indexArray(inArray) {
    inArray.forEach( function(elem,ignore,arr){ 
        // Add a named alias to each entry.
        if (isValid(elem.id) && !isValid(arr[elem.id])) { 
            Object.defineProperty(arr, elem.id, { value : elem, enumerable:false });
            }
        else { console.log("Duplicate or missing asset ID: "+elem.id); }

        elem.init(); // Initialize data for this item.
}); }
indexArray(civData);

var resourceData= [];
var buildingData= [];
var upgradeData = [];
var powerData = [];
var unitData = [];
var achData = [];
var sackable= [];
var lootable= [];
var killable= [];

civData.forEach( function(elem){ 
    if (elem.type == "resource") { resourceData.push(elem); } 
    if (elem.type == "building") { buildingData.push(elem); } 
    if (elem.subType == "prayer") { powerData.push(elem); }
    else if (elem.type == "upgrade") { upgradeData.push(elem); }
    if (elem.type == "unit") { unitData.push(elem); }
    if (elem.type == "achievement") { achData.push(elem); }
    if (elem.type == "building" && elem.vulnerable === true) { sackable.push(elem); }
    if (elem.type == "resource" && elem.vulnerable === true) { lootable.push(elem); }
    if (elem.type == "unit" && elem.vulnerable === true) { killable.push(elem); }
});


function getJobSingular(job) { return civData[job].singular; }


var totalBuildings = 0;
function countTotalBuildings(civ)
{
    return civ.tent.owned + civ.hut.owned + civ.cottage.owned + civ.house.owned + civ.mansion.owned + civ.barn.owned 
    + civ.woodstock.owned + civ.stonestock.owned + civ.tannery.owned + civ.smithy.owned + civ.apothecary.owned 
    + civ.temple.owned + civ.barracks.owned + civ.stable.owned + civ.mill.owned + civ.graveyard.owned 
    + civ.fortification.owned + civ.battleAltar.owned + civ.fieldsAltar.owned + civ.underworldAltar.owned + civ.catAltar.owned;
}

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
    array:[],  // Array of [name, resourceId] for all wonders.
    name:"",
    building:false, // 'true' once construction starts, and back to 'false' after final selection made.
    completed:false, // 'true' once construction finished.
    rushed:false,
    progress:0
};
efficiency = {
    happiness:1
};
var trader = {
    material:false,
    requested:0,
    timer:0
},
targetMax = "thorp";
raiding = {
    raiding:false,
    victory:false,
    epop:0,
    plunderLoot: {},
    last:""
};

// These are settings that should probably be tied to the browser.
var settings = {
    autosave : true,
    autosaveCounter : 1,
    autosaveTime : 60, //Currently autosave is every minute. Might change to 5 mins in future.
    customIncr : false,
    fontSize : 1.0,
    delimiters : true,
    textShadow : false,
    notes : true,
    worksafe : false,
    useIcons : true
};

var body = document.getElementsByTagName("body")[0];

function calcCombatMods() { return (0.01 * ((civData.riddle.owned) + (civData.weaponry.owned) + (civData.shields.owned))); }

// Some attackers get a damage mod against some defenders
//xxx This is too fragile; the unit definitions should be expanded with
// categories, and this method rewritten using those categories instead
// of specific unit types.
function getCasualtyMod(attacker,defender)
{
    if ((defender == "cavalry" || defender == "cavalryParty") && (attacker != "wolf"))
    {
        return 1.50; // Cavalry take 50% more casualties vs infantry
    }

    return 1.0; // Otherwise no modifier
}

// Get an object's requirements in text form.
// Pass it a cost object and optional quantity
function getReqText(costObj, qty)
{
    if (!isValid(qty)) { qty = 1; }
    costObj = valOf(costObj,qty); // valOf evals it if it's a function
    if (!isValid(costObj)) { return ""; }

    var i, num;
    var text = "";
    for(i in costObj)
    {
        // If the cost is a function, eval it with qty as a param.  Otherwise
        // just multiply by qty.
        num = (typeof costObj[i] == "function") ? (costObj[i](qty)) : (costObj[i]*qty);
        if (!num) { continue; }
        if (text) { text += ", "; }
        text += prettify(Math.round(num)) + " " + civData[i].name;
    }

    return text;
}

// Returns when the player meets the given upgrade prereqs.
// Undefined prereqs are assumed to mean the item is unpurchasable
function meetsPrereqs(prereqObj)
{
    if (!isValid(prereqObj)) { return false; }
    var i;
    for(i in prereqObj)
    {
        //xxx HACK:  Ugly special checks for non-upgrade pre-reqs.
        // This should be simplified/eliminated once the resource
        // system is unified.
        if (i === "deity") { // Deity
            if (getCurDeityDomain() != prereqObj[i]) { return false; }
        } else if (i === "wonder") { //xxx Hack currently used for wonder.building
            if (!wonder.building) { return false; }
        } else if (isValid(civData[i]) && isValid(civData[i].owned)) { // Resource/Building/Upgrade
            if (civData[i].owned < prereqObj[i]) { return false; }
        }
    }

    return true;
}


// Returns how many of this item the player can afford.
// Looks only at the item's cost and the player's resources, and not
// at any other limits.
// Negative quantities are always fully permitted.
// An undefined cost structure is assumed to mean it cannot be purchased.
// A boolean quantity is converted to +1 (true) -1 (false)
//xxx Caps nonlinear purchases at +1, blocks nonlinear sales.
// costObj - The cost substructure of the object to purchase
function canAfford(costObj, qty)
{
    if (!isValid(costObj)) { return 0; }
    if (qty === undefined) { qty = Infinity; } // default to as many as we can
    if (qty === false) { qty = -1; } // Selling back a boolean item.
    var i;
    for(i in costObj)
    {
        if (costObj[i] === 0) { continue; }

        //xxx We don't handle nonlinear costs here yet.
        // Cap nonlinear purchases to one at a time.
        // Block nonlinear sales.
        if (typeof costObj[i] == "function") { qty = Math.max(0,Math.min(1,qty)); }

        qty = Math.min(qty,Math.floor(civData[i].owned/valOf(costObj[i])));
        if (qty === 0) { return qty; }
    }

    return qty;
}

// Tries to pay for the specified quantity of the given cost object.
// Pays for fewer if the whole amount cannot be paid.
// Return the quantity that could be afforded.
//xxx DOES NOT WORK for nonlinear building cost items!
function payFor(costObj, qty)
{
    if (qty === undefined) { qty = 1; } // default to 1
    if (qty === false) { qty = -1; } // Selling back a boolean item.
    costObj = valOf(costObj,qty); // valOf evals it if it's a function
    if (!isValid(costObj)) { return 0; }

    qty = Math.min(qty,canAfford(costObj));
    if (qty === 0) { return 0; }

    var i,num;
    for(i in costObj)
    {
        // If the cost is a function, eval it with qty as a param.  Otherwise
        // just multiply by qty.
        num = (typeof costObj[i] == "function") ? (costObj[i](qty)) : (costObj[i]*qty);
        if (!num) { continue; }
        civData[i].owned -= num;
    }

    return qty;
}

// Returns the number of the object that we could buy or sell, taking into
// account any applicable limits.
// purchaseObj - The object to purchase
// qty - Maximum number to buy/sell (use -Infinity for the max salable)
function canPurchase(purchaseObj,qty)
{
    if (!purchaseObj) { return 0; }
    if (qty === undefined) { qty = Infinity; } // Default to as many as we can.
    if (qty === false) { qty = -1; } // Selling back a boolean item.

    // Can't buy if we don't meet the prereqs.
    if (!meetsPrereqs(purchaseObj.prereqs)) { qty = Math.min(qty, 0); }

    // Can't sell more than we have (if salable at all)
    qty = Math.max(qty, -(purchaseObj.salable ? purchaseObj.owned : 0));
    
    // If this is a relocation, can't shift more than our source pool.
    if (purchaseObj.source) { qty = Math.min(qty, civData[purchaseObj.source].owned); }

    // If this is a destination item, it's just a relocation of an existing
    // item, so we ignore purchase limits.  Otherwise we check them.
    if (purchaseObj.isDest && !purchaseObj.isDest()) { qty = Math.min(qty, purchaseObj.limit - purchaseObj.total); }

    // See if we can afford them; return fewer if we can't afford them all
    return Math.min(qty,canAfford(purchaseObj.require));
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

// Generate two HTML <span> texts to display an item's cost and effect note.
function getCostNote(civObj)
{
    // Only add a ":" if both items are present.
    var reqText = getReqText(civObj.require);
    var effectText = (isValid(civObj.effectText)) ? civObj.effectText : "";
    var separator = (reqText && effectText) ? ": " : "";

    return "<span id='"+civObj.id+"Cost' class='cost'>" + reqText + "</span>"
         + "<span id='"+civObj.id+"Note' class='note'>" + separator + civObj.effectText + "</span>";
}

// Number format utility functions.
// - Allows testing the sign of strings that might be prefixed with '-' (like "-custom")
// - Output format uses the proper HTML entities for minus sign and infinity.
// Note that the sign of boolean false is treated as -1, since it indicates a
//   decrease in quantity (from 1 to 0).
function sgnnum(x) { return (x > 0) ? 1 : (x < 0) ? -1 : 0; }
function sgnstr(x) { return (x.length === 0) ? 0 : (x[0] == "-") ? -1 : 1; }
function sgnbool(x) { return (x ? 1 : -1); }
function absstr(x) { return (x.length === 0) ? "" : (x[0] == "-") ? x.slice(1) : x; }
function sgn(x) { return (typeof x == "number") ? sgnnum(x) 
                       : (typeof x == "string") ? sgnstr(x) 
                       : (typeof x == "boolean") ? sgnbool(x) : 0; }
function abs(x) { return (typeof x == "number") ? Math.abs(x) : (typeof x == "string") ? absstr(x) : x; }

function getPurchaseCellText(purchaseObj, qty, inTable) {
    if (inTable === undefined) { inTable = true; }
    // Internal utility functions.
    function sgnchr(x) { return (x > 0) ? "+" : (x < 0) ? "&minus;" : ""; }
    //xxx Hack: Special formatting for booleans, Infinity and 1k.
    function infchr(x) { return (x == Infinity) ? "&infin;" : (x == 1000) ? "1k" : x; }
    function fmtbool(x) {
        var neg = (sgn(x) < 0);
        return (neg ? "(" : "") + purchaseObj.name + (neg ? ")" : "");
    }
    function fmtqty(x) { return (typeof x == "boolean") ? fmtbool(x) : sgnchr(sgn(x))+infchr(abs(x)); }
    function allowPurchase() {
        if (!qty) { return false; } // No-op

        // Can't buy/sell items not controlled by player
        if (purchaseObj.alignment && (purchaseObj.alignment != "player")) { return false; }

        // Quantities > 1 are meaningless for boolean items.
        if ((typeof purchaseObj.initOwned == "boolean")&&(abs(qty) > 1)) { return false; }

        // Don't buy/sell unbuyable/unsalable items.
        if ((sgn(qty) > 0) && (purchaseObj.require === undefined)) { return false; }
        if ((sgn(qty) < 0) && (!purchaseObj.salable)) { return false; }

        //xxx Right now, variable-cost items can't be sold, and are bought one-at-a-time.
        if ((qty != 1) && purchaseObj.hasVariableCost()) { return false; }

        return true;
    }

    var tagName = inTable ? "td" : "span";
    var className = (abs(qty) == "custom") ? "buy" : purchaseObj.type;  // 'custom' buttons all use the same class.
    var s = "<"+tagName+" class='"+className+abs(qty)+"'>";
    if (allowPurchase()) 
    { 
        s +="<button class='x"+abs(qty)+"' data-action='purchase' data-quantity='"+qty+"' data-target='"+purchaseObj.id+"' "
        +" disabled='disabled'" +" onmousedown=\"onPurchase(this)\">"+fmtqty(qty)+"</button>"; 
    }
    s += "</"+tagName+">";
    return s;
}

// Pass this the item definition object.
// Or pass nothing, to create a blank row.
function getPurchaseRowText(purchaseObj)
{
    if (!purchaseObj) { return "<tr class='purchaseRow'><td colspan='13'/>&nbsp;</tr>"; }

    var objId = purchaseObj.id;
    var s = "<tr id='"+objId+"Row' class='purchaseRow'>";
 
    [-Infinity, "-custom", -100, -10, -1]
    .forEach(function(elem) { s += getPurchaseCellText(purchaseObj, elem); });

    var enemyFlag = (purchaseObj.alignment == "enemy") ? " enemy" : "";
    s += "<td class='itemname"+enemyFlag+"'>"+purchaseObj.plural+": </td>";

    var action = (isValid(population[objId])) ? "display_pop" : "display"; //xxx Hack
    s += "<td class='number'><span data-action='"+action+"' data-target='"+objId+"'>0</span></td>";

    // Don't allow Infinite (max) purchase on things we can't sell back.
    [1, 10, 100, "custom", ((purchaseObj.salable) ? Infinity : 1000)]
    .forEach(function(elem) { s += getPurchaseCellText(purchaseObj, elem); });

    s += "<td>" + getCostNote(purchaseObj) + "</td>";
    s += "</tr>";

    return s;
}
// Dynamically create the building controls table.
function addBuildingRows()
{
    var s="";
    buildingData.forEach(function(elem) { if (elem.subType == "normal") { s += getPurchaseRowText(elem); } });
    document.getElementById("buildings").innerHTML += s;
}
// Dynamically create the job controls table.
function addJobRows()
{
    var s="";
    unitData.forEach(function(elem) { if (elem.location == "home") { s += getPurchaseRowText(elem); } });
    document.getElementById("jobs").innerHTML += s;
}
// Dynamically create the party controls table.
function addPartyRows()
{
    var s="";
    unitData.forEach(function(elem) { if (elem.location == "party") { s += getPurchaseRowText(elem); } });
    document.getElementById("party").innerHTML += s;
}

//xxx This should become an onGain() member method of the building classes
function updateRequirements(buildingObj){
    var displayNode = document.getElementById(buildingObj.id + "Cost");
    if (displayNode) { displayNode.innerHTML = getReqText(buildingObj.require); }
}

function updatePurchaseRow(purchaseObj){
    if (!purchaseObj) { return; }

    var elem = document.getElementById(purchaseObj.id + "Row");
    if (!elem) { console.log("Missing UI for "+purchaseObj.id); return; }

    // If the item's cost is variable, update its requirements.
    if (purchaseObj.hasVariableCost()) { updateRequirements(purchaseObj); }

    // Already having one reveals it as though we met the prereq.
    var havePrereqs = (purchaseObj.owned > 0) || meetsPrereqs(purchaseObj.prereqs);

    // Special check: Hide one-shot upgrades after purchase; they're
    // redisplayed elsewhere.
    var hideBoughtUpgrade = ((purchaseObj.type == "upgrade") && (purchaseObj.owned == purchaseObj.limit) && !purchaseObj.salable);

    // Reveal the row if  prereqs are met
    setElemDisplay(elem,havePrereqs && !hideBoughtUpgrade);

    var maxQty = canPurchase(purchaseObj);
    var minQty = canPurchase(purchaseObj,-Infinity);

    var buyElems=elem.querySelectorAll("[data-action='purchase']");
    var i, purchaseQty,absQty,curElem;
    for (i=0;i<buyElems.length;++i)
    {
        curElem = buyElems[i];
        purchaseQty = dataset(curElem,"quantity");
        // Treat 'custom' or Infinity as +/-1.
        //xxx Should we treat 'custom' as its appropriate value instead?
        absQty = abs(purchaseQty);
        if ((absQty == "custom") || (absQty == Infinity)) { purchaseQty = sgn(purchaseQty); }

        curElem.disabled = ((purchaseQty > maxQty) || (purchaseQty < minQty));
    }
}

//enables/disabled building buttons - calls each type of building in turn
function updateBuildingButtons(){
    //Can't do altars; they're not in the proper format.
    buildingData.forEach(function(elem) { if (elem.subType == "normal") { updatePurchaseRow(elem); } });
}
function updateJobButtons(){
    //Update the page with the latest worker distribution and stats
    unitData.forEach(function(elem) { if (elem.location == "home") { updatePurchaseRow(elem); } });
}
function updatePartyButtons(){
    //updates the party (and enemies)
    unitData.forEach(function(elem) { if (elem.location == "party") { updatePurchaseRow(elem); } });
}


// We have a separate row generation function for upgrades, because their
// layout is differs greatly from buildings/units:
//  - Upgrades are boolean, so they don't need multi-purchase buttons.
//  - Upgrades don't need quantity labels, and put the name in the button.
//  - Upgrades are sometimes generated in a table with <tr>, but sometimes
//    outside of one with <span>.
function getUpgradeRowText(upgradeObj, inTable)
{
    if (inTable === undefined) { inTable = true; }
    var cellTagName = inTable ? "td" : "span";
    var rowTagName = inTable ? "tr" : "span";
    if (!upgradeObj) { return inTable ? "<"+rowTagName+" class='purchaseRow'><td colspan='2'/>&nbsp;</"+rowTagName+">" : ""; }

    var s=  "<"+rowTagName+" id='"+upgradeObj.id+"Row' class='purchaseRow'>";
    s +=    getPurchaseCellText(upgradeObj, true);
    s +=    "<"+cellTagName+">" + getCostNote(upgradeObj) + "</"+cellTagName+">";
    if (!inTable) { s += "<br />"; }
    s +=    "</"+rowTagName+">";
    return s;
}
function getPantheonUpgradeRowText(upgradeObj)
{
    if (!upgradeObj) { return ""; }

    var s = "<tr id='"+upgradeObj.id+"Row' class='purchaseRow'>";
    // Don't include devotion if it isn't valid.
    //xxx Should write a chained dereference eval
    s += "<td class='devcost'>";
    s +=     ((isValid(upgradeObj.prereqs) && isValid(upgradeObj.prereqs.devotion)) 
            ? (upgradeObj.prereqs.devotion +"d&nbsp;") : "") +"</td>";
    //xxx The 'fooRow' id is added to make altars work, but should be redesigned.
    s += "<td class='"+upgradeObj.type+"true'><button id='"+upgradeObj.id+"' class='xtrue'";
    s += " data-action='purchase' data-quantity='true' data-target="+upgradeObj.id;
    s += " disabled='disabled' onmousedown=\"";
    // The event handler can take three forms, depending on whether this is
    // an altar, a prayer, or a pantheon upgrade.
    s += ((upgradeObj.subType == "prayer") ? (upgradeObj.id+"()")
                                           : ("onPurchase(this)"));
    s += "\">" + upgradeObj.name + "</button>";
    s += (isValid(upgradeObj.extraText) ? upgradeObj.extraText : "")+"</td>";
    s += "<td>" + getCostNote(upgradeObj) + "</td>";
    s += "</tr>";

    return s;
}
// Returns the new element
function setPantheonUpgradeRowText(upgradeObj)
{
    if (!upgradeObj) { return null; }
    var elem = document.getElementById(upgradeObj.id+"Row");
    if (!elem) { return null; }

    elem.outerHTML = getPantheonUpgradeRowText(upgradeObj);
    return elem;
}
// Dynamically create the upgrade purchase buttons.
function addUpgradeRows()
{
    var s="";

    // Place the stubs for most upgrades under the upgrades tab.
    upgradeData.forEach( function(elem){ if (elem.subType=="upgrade") { s += getUpgradeRowText(elem); } });
    document.getElementById("upgrades").innerHTML = s;

    document.getElementById("upgradesPane").innerHTML += 
       "<h3>Purchased Upgrades</h3>" + "<div id='purchasedUpgrades'></div>";

    // Fill in any pre-existing stubs.
    upgradeData.forEach( function(elem){ 
        if (elem.subType == "upgrade") { return; } // Did these above.
        if (elem.subType == "pantheon") { setPantheonUpgradeRowText(elem); }
        else { // One of the 'atypical' upgrades not displayed in the main upgrade list.
            var stubElem = document.getElementById(elem.id+"Row");
            if (!stubElem) { console.log("Missing UI element for "+elem.id); return; }
            stubElem.outerHTML = getUpgradeRowText(elem, false);
        }
    });

    // Altars
    buildingData.forEach(function(elem) { if (elem.subType == "altar") { setPantheonUpgradeRowText(elem); } });

    // Deity granted powers
    powerData.forEach(function(elem) { if (elem.subType == "prayer") { setPantheonUpgradeRowText(elem); } });

    // Dynamically create two lists for purchased upgrades.
    // One for regular upgrades, one for pantheon upgrades.
    var text="", standardUpgStr="", pantheonUpgStr="";

    upgradeData.forEach( function(upgradeObj){ 
        text = "<span id='P"+upgradeObj.id +"' class='Pupgrade'>"
            +"<strong>"+upgradeObj.name+"</strong>"
            +" &ndash; "+upgradeObj.effectText+"<br/></span>";
        if (upgradeObj.subType == "pantheon") { pantheonUpgStr += text; }
        else { standardUpgStr += text; }
    });

    document.getElementById("purchasedUpgrades").innerHTML += standardUpgStr;
    document.getElementById("purchasedPantheon").innerHTML = pantheonUpgStr;
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
    //xxx Note that this is now also updating nearly all updatable values,
    // including population.
    displayElems=document.querySelectorAll("[data-action='display']");
    for (i=0;i<displayElems.length;++i)
    {
        elem = displayElems[i];
        elem.innerHTML = prettify(Math.floor(curCiv[dataset(elem,"target")].owned));
    }

    // Update net production values for primary resources.  Same as the above,
    // but look for "data-action" == "displayNet".
    displayElems=document.querySelectorAll("[data-action='displayNet']");
    for (i=0;i<displayElems.length;++i)
    {
        elem = displayElems[i];
        val = curCiv[dataset(elem,"target")].net;
        if (!isValid(val)) { continue; }

        // Colourise net production values.
        if      (val < 0) { elem.style.color="#f00"; }
        else if (val > 0) { elem.style.color="#0b0"; }
        else              { elem.style.color="#000"; }

        elem.innerHTML = prettify(val.toFixed(1));
    }

    if (curCiv.gold.owned >= 1){
        setElemDisplay(document.getElementById("goldRow"),true);
    }

    //Update page with building numbers, also stockpile limits.
    document.getElementById("maxfood").innerHTML = prettify(civData.food.limit);
    document.getElementById("maxwood").innerHTML = prettify(civData.wood.limit);
    document.getElementById("maxstone").innerHTML = prettify(civData.stone.limit);

    //Update land values
    totalBuildings = countTotalBuildings(curCiv);
    document.getElementById("totalLand").innerHTML = prettify(curCiv.freeLand.owned + totalBuildings);
    document.getElementById("totalBuildings").innerHTML = prettify(totalBuildings);

    // Unlock advanced control tabs as they become enabled (they never disable)
    // Temples unlock Deity, barracks unlock Conquest, having gold unlocks Trade.
    // Deity is also unlocked if there are any prior deities present.
    if ((curCiv.temple.owned > 0)||(curCiv.deities.length > 1)) { setElemDisplay(document.getElementById("deitySelect"),true); }
    if (curCiv.barracks.owned > 0) { setElemDisplay(document.getElementById("conquestSelect"),true); }
    if (curCiv.gold.owned > 0) { setElemDisplay(document.getElementById("tradeSelect"),true); }

    // Need to have enough resources to trade
    document.getElementById("trader").disabled = !trader || !trader.timer ||
        (trader.material.owned < trader.requested);

    // Cheaters don't get names.
    document.getElementById("renameRuler").disabled = (curCiv.rulerName == "Cheater");

    updatePopulation(); //updatePopulation() handles the population caps, which are determined by buildings.
    updatePopulationUI();
}

function updatePopulation(){
    //Update population cap by multiplying out housing numbers
    population.cap = curCiv.tent.owned + (curCiv.hut.owned * 3) + (curCiv.cottage.owned * 6) + (curCiv.house.owned * (10 + ((civData.tenements.owned) * 2) + ((civData.slums.owned) * 2))) + (curCiv.mansion.owned * 50);

    //Update sick workers
    population.totalSick = 0;
    unitData.forEach(function(elem) { if (elem.alignment == "player") { population.totalSick += (elem.ill||0); } });
    setElemDisplay(document.getElementById("totalSickRow"),(population.totalSick > 0));

    //Calculate healthy workers (excludes sick, zombies and deployed units)
    population.healthy = 0;
    unitData.forEach(function(elem) { if ((elem.vulnerable)) { population.healthy += elem.owned; } });
    population.healthy -= curCiv.zombie.owned;

    //Calculate housed/fed population (excludes zombies)
    population.current = population.healthy + population.totalSick + civData.soldierParty.owned + civData.cavalryParty.owned;
    unitData.forEach(function(elem) { if ((elem.alignment == "player")&&(elem.subType == "normal")&&(elem.location == "party")) 
    { population.current += elem.owned; } });

    //Zombie soldiers dying can drive population.current negative if they are killed and zombies are the only thing left.
    if (population.current < 0){
        if (curCiv.zombie.owned > 0){
            //This fixes that by removing zombies and setting to zero.
            curCiv.zombie.owned += population.current;
            population.current = 0;
        } else {
            console.log("Warning: Negative current population detected.");
        }
    }
}

//Update page with numbers
function updatePopulationUI() {
    var i, elem, elems, displayElems;

    // Scan the HTML document for elements with a "data-action" element of
    // "display_pop".  The "data-target" of such elements is presumed to contain
    // the population subproperty to be displayed as the element's content.
    //xxx This selector should probably require data-target too.
    //xxx Note that relatively few values are still stored in the population
    // struct; most of them are now updated by the 'display' action run
    // by updateResourceTotals().
    displayElems=document.querySelectorAll("[data-action='display_pop']");
    for (i=0;i<displayElems.length;++i)
    {
        elem = displayElems[i];
        elem.innerHTML = prettify(Math.floor(population[dataset(elem,"target")]));
    }

    civData.house.update(); //xxx Effect might change dynamically.  Need a more general way to do this.

    setElemDisplay(document.getElementById("graveTotal"),(curCiv.grave.owned > 0));

    //As population increases, various things change
    // Update our civ type name
    var civType = civSizes.getCivSize(population.current).name;
    if (population.current === 0 && population.cap >= 1000){
        civType = "Ghost Town";
    }
    if (curCiv.zombie.owned >= 1000 && curCiv.zombie.owned >= 2 * population.current){ //easter egg
        civType = "Necropolis";
    }
    document.getElementById("civType").innerHTML = civType;

    //Unlocking interface elements as population increases to reduce unnecessary clicking
    //xxx These should be reset in reset()
    if (population.current + curCiv.zombie.owned >= 10) {
        if (!settings.customIncr){    
            elems = document.getElementsByClassName("unit10");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
        }
    }
    if (population.current + curCiv.zombie.owned >= 100) {
        if (!settings.customIncr){
            elems = document.getElementsByClassName("building10");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
            elems = document.getElementsByClassName("unit100");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
        }
    }
    if (population.current + curCiv.zombie.owned >= 1000) {
        if (!settings.customIncr){
            elems = document.getElementsByClassName("building100");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
            elems = document.getElementsByClassName("unit1000");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
            elems = document.getElementsByClassName("unitInfinity");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
        }
    }
    if (population.current + curCiv.zombie.owned >= 10000) {
        if (!settings.customIncr){
            elems = document.getElementsByClassName("building1000");
            for(i = 0; i < elems.length; i++) {
                setElemDisplay(elems[i],!settings.customincr);
            }
        }
    }

    //Turning on/off buttons based on free space.
    var maxSpawn = Math.max(0,Math.min((population.cap - population.current),logSearchFn(calcWorkerCost,curCiv.food.owned)));

    document.getElementById("spawn1button").disabled = (maxSpawn < 1);
    document.getElementById("spawnCustomButton").disabled = (maxSpawn < 1);
    document.getElementById("spawnMaxbutton").disabled = (maxSpawn < 1);
    document.getElementById("spawn10button").disabled = (maxSpawn < 10);
    document.getElementById("spawn100button").disabled = (maxSpawn < 100);
    document.getElementById("spawn1000button").disabled = (maxSpawn < 1000);

    var canRaise = (getCurDeityDomain() == "underworld" && civData.devotion.owned >= 20);
    var maxRaise = canRaise ? logSearchFn(calcZombieCost,curCiv.piety.owned) : 0;
    setElemDisplay(document.getElementById("raiseDeadRow"), canRaise);
    document.getElementById("raiseDead").disabled = (maxRaise < 1);
    document.getElementById("raiseDeadMax").disabled = (maxRaise < 1);
    document.getElementById("raiseDead100").disabled = (maxRaise < 100);

    //Calculates and displays the cost of buying workers at the current population.
    document.getElementById("raiseDeadCost").innerHTML = prettify(Math.round(calcZombieCost(1)));
    document.getElementById("workerCost").innerHTML = prettify(Math.round(calcWorkerCost(1)));
    document.getElementById("workerCost10").innerHTML = prettify(Math.round(calcWorkerCost(10)));
    document.getElementById("workerCost100").innerHTML = prettify(Math.round(calcWorkerCost(100)));
    document.getElementById("workerCost1000").innerHTML = prettify(Math.round(calcWorkerCost(1000)));
    document.getElementById("workerNumMax").innerHTML = prettify(Math.round(maxSpawn));
    document.getElementById("workerCostMax").innerHTML = prettify(Math.round(calcWorkerCost(maxSpawn)));
    updateJobButtons(); //handles the display of units in the player's kingdom.
    updatePartyButtons(); // handles the display of units out on raids.
    updateHappiness();
    updateAchievements(); //handles display of achievements
}


function typeToId(deityType) {
    if (deityType == "Battle")         { return "battle"; }
    if (deityType == "Cats")           { return "cats"; }
    if (deityType == "the Fields")     { return "fields"; }
    if (deityType == "the Underworld") { return "underworld"; }
    return deityType;
}
function idToType(domainId) {
    if (domainId == "battle")          { return "Battle"; }
    if (domainId == "cats")            { return "Cats"; }
    if (domainId == "fields")          { return "the Fields"; }
    if (domainId == "underworld")      { return "the Underworld"; }
    return domainId;
}


// Check to see if the player has an upgrade and hide as necessary
// Check also to see if the player can afford an upgrade and enable/disable as necessary
function updateUpgrades(){
    var deitySpecEnable;

    // Update all of the upgrades
    upgradeData.forEach( function(elem){ 
        updatePurchaseRow(elem);  // Update the purchase row.

        // Show the already-purchased line if we've already bought it.
        setElemDisplay(document.getElementById("P"+elem.id),elem.owned);
    });

    //deity techs
    document.getElementById("renameDeity").disabled = (!civData.worship.owned);
    setElemDisplay(document.getElementById("deityDomains"),((civData.worship.owned) && (getCurDeityDomain() === "")));
    setElemDisplay(document.getElementById("battleUpgrades"),(getCurDeityDomain() == "battle"));
    setElemDisplay(document.getElementById("fieldsUpgrades"),(getCurDeityDomain() == "fields"));
    setElemDisplay(document.getElementById("underworldUpgrades"),(getCurDeityDomain() == "underworld"));
    setElemDisplay(document.getElementById("zombieWorkers"), (curCiv.zombie.owned > 0));
    setElemDisplay(document.getElementById("catsUpgrades"),(getCurDeityDomain() == "cats"));

    deitySpecEnable = civData.worship.owned && (getCurDeityDomain() === "") && (curCiv.piety.owned >= 500);
    document.getElementById("battleDeity").disabled = !deitySpecEnable;
    document.getElementById("fieldsDeity").disabled = !deitySpecEnable;
    document.getElementById("underworldDeity").disabled = !deitySpecEnable;
    document.getElementById("catsDeity").disabled = !deitySpecEnable;

    //standard
    setElemDisplay(document.getElementById("raidGroup"),civData.standard.owned && !raiding.raiding);
    setElemDisplay(document.getElementById("conquest"),civData.standard.owned);

    // Trade
    setElemDisplay(document.getElementById("tradeUpgradeContainer"),civData.trade.owned);
}


function updateDeity(){
    //Update page with deity details
    document.getElementById("deityAName").innerHTML = curCiv.deities[0].name;
    document.getElementById("deityADomain").innerHTML = getCurDeityDomain() ? ", deity of "+idToType(getCurDeityDomain()) : "";
    document.getElementById("deityADevotion").innerHTML = curCiv.devotion.owned;

    // Display if we have an active deity, or any old ones.
    setElemDisplay(document.getElementById("deityContainer"),(curCiv.deities[0].name));
    setElemDisplay(document.getElementById("activeDeity"),(curCiv.deities[0].name));
    setElemDisplay(document.getElementById("oldDeities"),(curCiv.deities[0].name || curCiv.deities.length > 1));
    setElemDisplay(document.getElementById("iconoclasmGroup"),(curCiv.deities.length > 1));
}

function getDeityRowText(deityId, deityObj)
{
    if (!deityObj) { deityObj = { name:"No deity", domain:"", maxDev:0 }; }

    return "<tr id='"+deityId+"'>"
    + "<td><strong><span id='"+deityId+"Name'>"+deityObj.name+"</span></strong>"
    + "<span id="+deityId+"Domain' class='deityDomain'>"+"</td><td>"+idToType(deityObj.domain)+"</span></td>"
    + "<td><span id='" + deityId + "Devotion'>"+deityObj.maxDev+"</span></td></tr>";
}

function makeDeitiesTables()
{
    // Display the active deity
    var deityId = "deityA";
    document.getElementById("activeDeity").innerHTML = '<tr id="' + deityId + '">'
    + '<td><strong><span id="' + deityId + 'Name">'+'</span></strong>'
    + '<span id="' + deityId + 'Domain" class="deityDomain">' + '</span></td>'
    + '<td>Devotion: <span id="' + deityId + 'Devotion">'+'</span></td></tr>';

    // Display the table of prior deities.
    //xxx Change this to <th>, need to realign left.
    var s = "<tr><td><b>Name</b></td><td><b>Domain</b></td><td><b>Max Devotion</b></td></tr>";
    curCiv.deities.forEach(function(elem, i) {
        if ((i===0)&&(!elem.name)) { return; } // Don't display current deity-in-waiting.
        s += getDeityRowText("deity"+i,elem);
    });
    document.getElementById("oldDeities").innerHTML = s;

    updateDeity();
}

// Enables or disables availability of activated religious powers.
// Passive religious benefits are handled by the upgrade system.
function updateDevotion(){
    document.getElementById("deityA"+"Devotion").innerHTML = curCiv.devotion.owned;

    // Process altars
    buildingData.forEach(function(elem) { if (elem.subType == "altar") {
        setElemDisplay(document.getElementById(elem.id+"Row"), meetsPrereqs(elem.prereqs));
        document.getElementById(elem.id).disabled = (!(meetsPrereqs(elem.prereqs) && canAfford(elem.require)));
    }});

    // Process activated powers
    powerData.forEach(function(elem) { if (elem.subType == "prayer") {
        //xxx raiseDead buttons updated by UpdatePopulationUI
        if (elem.id == "raiseDead") { return; }
        setElemDisplay(document.getElementById(elem.id+"Row"), meetsPrereqs(elem.prereqs));
        document.getElementById(elem.id).disabled = !(meetsPrereqs(elem.prereqs) && canAfford(elem.require));
    }});

    //xxx Smite should also be disabled if there are no foes.

    //xxx These costs are not yet handled by canAfford().
    if (population.healthy < 1) { 
        document.getElementById("wickerman").disabled = true; 
        document.getElementById("walk").disabled = true; 
    }

    document.getElementById("ceaseWalk").disabled = (curCiv.walkTotal === 0);
}


// achObj can be:
//   true:  Generate a line break
//   false: Generate a gap
//   An achievement (or civ size) object: Generate the display of that achievement
function getAchRowText(achObj)
{
    if (achObj===true)  { return "<div style='clear:both;'><br /></div>"; }
    if (achObj===false) { return "<div class='break'>&nbsp;</div>"; }
    return "<div class='achievement' title='"+achObj.name+"'>"+
            "<div class='unlockedAch' id='"+achObj.id+"'>"+achObj.name+"</div></div>";
}

// Dynamically create the achievement display
function addAchievementRows()
{
    var s="";
    achData.forEach(function(elem) { s += getAchRowText(elem); });
    document.getElementById("achievements").innerHTML += s;
}

//Displays achievements if they are unlocked
function updateAchievements(){
    achData.forEach(function(achObj) { 
        setElemDisplay(document.getElementById(achObj.id),achObj.owned);
    });
}

function testAchievements(){
    achData.forEach(function(achObj) { 
        if (civData[achObj.id].owned) { return true; }
        if (isValid(achObj.test) && !achObj.test()) { return false; }
        civData[achObj.id].owned = true;
        gameLog("Achievement Unlocked: "+achObj.name);
        return true;
    });

    updateAchievements();
}


// Dynamically add the raid buttons for the various civ sizes.
function addRaidRows()
{
    var i, s="";

    for (i=0;i<civSizes.length;++i) {
        s += "<button class='raid' data-civtype='"+civSizes[i].id+"' onmousedown='onInvade(event)' disabled='disabled'>"+
        "Raid "+civSizes[i].name+"</button><br />"; //xxxL10N
    }

    document.getElementById("raidGroup").innerHTML += s;
}

// Enable the raid buttons for eligible targets.
function updateTargets(){
    var i;
    var raidButtons = document.getElementsByClassName("raid");
    var haveArmy = ((civData.soldierParty.owned + civData.cavalryParty.owned) > 0);
    var curElem;
    for(i=0;i<raidButtons.length;++i)
    {
        // Disable if we have no standard, no army, or they are too big a target.
        curElem = raidButtons[i];
        curElem.disabled = (!civData.standard.owned||!haveArmy || (civSizes[dataset(curElem,"civtype")] > civSizes[targetMax]));
    }
}

function updateHappiness(){
    //updates the happiness stat
    var text, color;
    //first check there"s someone to be happy or unhappy, not including zombies
    if (population.current < 1) { efficiency.happiness = 1; }

    if      (efficiency.happiness > 1.4) { text = "Blissful"; color = "#f0f"; }
    else if (efficiency.happiness > 1.2) { text = "Happy";    color = "#00f"; }
    else if (efficiency.happiness > 0.8) { text = "Content";  color = "#0b0"; } // Was "#0d0" if pop === 0
    else if (efficiency.happiness > 0.6) { text = "Unhappy";  color = "#880"; }
    else                                 { text = "Angry";    color = "#f00"; }

    document.getElementById("happiness").innerHTML = text;
    document.getElementById("happiness").style.color = color;
}

//updates the display of wonders and wonder building
function updateWonder() {
    var haveTech = (civData.architecture.owned && civData.civilservice.owned);

    // Display this section if we have any wonders or could build one.
    setElemDisplay(document.getElementById("wondersContainer"),(haveTech || wonder.total > 0));

    // Can start building a wonder, but haven't yet.
    setElemDisplay(document.getElementById("startWonderLine"),(haveTech && !wonder.building && !wonder.completed));
    document.getElementById("startWonder").disabled = (!haveTech || wonder.building || wonder.completed); 

    // Construction in progress; show/hide building area and labourers
    setElemDisplay(document.getElementById("labourerRow"),(wonder.building && !wonder.completed));
    setElemDisplay(document.getElementById("wonderInProgress"),(wonder.building && !wonder.completed));
    setElemDisplay(document.getElementById("speedWonderGroup"),(wonder.building && !wonder.completed));
    document.getElementById("speedWonder").disabled = (!wonder.building || wonder.completed || !canAfford({ gold: 100 }));
    if (wonder.building && !wonder.completed){
        document.getElementById("progressBar").style.width = wonder.progress.toFixed(2) + "%";
        document.getElementById("progressNumber").innerHTML = wonder.progress.toFixed(2);
    }

    // Finished, but haven't picked the resource yet.
    setElemDisplay(document.getElementById("wonderCompleted"),(wonder.building && wonder.completed));
 
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
    }
}

function updateReset(){
    setElemDisplay(document.getElementById("resetNote"  ), (civData.worship.owned || wonder.completed));
    setElemDisplay(document.getElementById("resetDeity" ), (civData.worship.owned));
    setElemDisplay(document.getElementById("resetWonder"), (wonder.completed));
    setElemDisplay(document.getElementById("resetBoth"  ), (civData.worship.owned && wonder.completed));
}

function updateSettings(){
    // Here, we ensure that UI is properly configured for our settings.
    // Calling these with no parameter makes them update the UI for the current values.
    setAutosave();
    setCustomQuantities();
    textSize(0);
    setDelimiters();
    setShadow();
    setNotes();
    setWorksafe();
    setIcons();
}

function update(){

    //unified update function. NOT YET IMPLEMENTED

    //debugging - mark beginning of function execution
    var start = new Date().getTime();

    //call each existing update subfunction in turn
    updateResourceTotals(); //need to remove call to updatePopulation, move references to upgrades
    updatePopulation(); //move enabling/disabling by space to updateJobButtons, remove calls to updateJobButtons, updateHappiness, updateAchievements
    updatePopulationUI();
    updateBuildingButtons();
    updateJobButtons();
    updatePartyButtons();
    updateUpgrades();
    //updateDeity(); --- only needs to be called on initialisation and deity-related interactions ---
    //makeDeitiesTables(); --- only needs to be called on initialisation and deity-related interactions ---
    updateDevotion(); //need to add else clauses to disable buttons, change the way updates are revealed (unhidden as devotion increases)
    //updateRequirements(); --- only needs to be called on building-related interactions, though must subsequently call the update() function ---
    updateAchievements(); //should probably include else clauses
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

//This function is called every time a player clicks on a primary resource button
function increment(objId){
    var purchaseObj = civData[objId];
    if (!purchaseObj) { console.log("Unknown purchase: "+objId); return; }

    purchaseObj.owned += purchaseObj.increment 
      + (purchaseObj.increment * 9 * (civData.civilservice.owned)) 
      + (purchaseObj.increment * 40 * (civData.feudalism.owned)) 
      + ((civData.serfs.owned) * Math.floor(Math.log(civData.unemployed.owned * 10 + 1))) 
      + ((civData.nationalism.owned) * Math.floor(Math.log((civData.soldier.owned + civData.cavalry.owned) * 10 + 1)));

    //Handles random collection of special resources.
    var specialChance = purchaseObj.specialChance;
    if (specialChance && purchaseObj.specialMaterial && civData[purchaseObj.specialMaterial]) {
        if ((purchaseObj === civData.food) && (civData.flensing.owned))    { specialChance += 0.1; }
        if ((purchaseObj === civData.stone) && (civData.macerating.owned)) { specialChance += 0.1; }
        if (Math.random() < specialChance){
            var specialMaterial = civData[purchaseObj.specialMaterial];
            specialMaterial.owned += purchaseObj.increment * (1 + (9 * (civData.guilds.owned)));
            gameLog("Found " + specialMaterial.name + " while " + purchaseObj.activity); // I18N
        }
    }
    //Checks to see that resources are not exceeding their caps
    if (purchaseObj.owned > purchaseObj.limit) { purchaseObj.owned = purchaseObj.limit; }

    document.getElementById("clicks").innerHTML = prettify(Math.round(++curCiv.resourceClicks));
    updateResourceTotals(); //Update the page with totals
}

// Buys or sells a unit, building, or upgrade.
// Pass a positive number to buy, a negative number to sell.
// If it can't add/remove as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass "custom" or "-custom" to use the custom increment.
// Returns the actual number bought or sold (negative if fired).
function doPurchase(objId,num){
    var purchaseObj = civData[objId];
    if (!purchaseObj) { console.log("Unknown purchase: "+objId); return 0; }
    if (num === undefined) { num = 1; }
    if (abs(num) ==  "custom") { num =  sgn(num) * getCustomNumber(purchaseObj); }

    num = canPurchase(purchaseObj,num);  // How many can we actually get?

    // Pay for them
    num = payFor(purchaseObj.require,num);
    if (abs(num) < 1) { 
        gameLog("Could not build, insufficient resources."); // I18N
        return 0;
    }

    //Then increment the total number of that building
    // Do the actual purchase; coerce to the proper type if needed
    purchaseObj.owned = matchType(purchaseObj.owned + num,purchaseObj.initOwned);
    if (purchaseObj.source) { civData[purchaseObj.source].owned -= num; }

    // Post-purchase triggers
    if (isValid(purchaseObj.onGain)) { purchaseObj.onGain(num); } // Take effect

    //Increase devotion if the purchase provides it.
    if (isValid(purchaseObj.devotion)) { 
        curCiv.devotion.owned += purchaseObj.devotion * num; 
        // If we've exceeded this deity's prior max, raise it too.
        if (curCiv.deities[0].maxDev < curCiv.devotion.owned) {
            curCiv.deities[0].maxDev = curCiv.devotion.owned;
            makeDeitiesTables();
        }
    }

    //Then check for overcrowding
    if ((purchaseObj.type == "building") && --curCiv.freeLand.owned < 0){
        gameLog("You are suffering from overcrowding.");  // I18N
        mood(Math.max(num,-curCiv.freeLand.owned) * -0.0025 * (civData.codeoflaws.owned ? 0.5 : 1.0));
    }

    updateRequirements(purchaseObj); //Increases buildings' costs
    updateResourceTotals(); //Update page with lower resource values and higher building total
    updatePopulationUI(); //updates the army display
    updateBuildingButtons(); //Update the buttons themselves
    updateJobButtons(); //Update page with individual worker numbers, since limits might have changed.
    updatePartyButtons(); 
    updateUpgrades(); //Update which upgrades are available to the player
    updateDevotion(); //might be necessary if building was an altar
    updateTargets(); // might enable/disable raiding

    return num;
}

function onPurchase(control) { 
    var objId = dataset(control,"target");
    var qty = dataset(control,"quantity");

    var purchaseObj = civData[objId];
    if (!purchaseObj) { return false; }
    
    return doPurchase(objId, qty);
}


function getCustomNumber(civObj){
    if (!civObj||!civObj.customQtyId) { return undefined; }
    var elem = document.getElementById(civObj.customQtyId);
    if (!elem) { return undefined; }

    var num = Number(elem.value);

    // Check the above operations haven't returned NaN
    // Also don't allow negative increments.
    if (isNaN(num) || num < 0){
        elem.style.background = "#f99"; //notify user that the input failed
        return 0;
    } 

    num = Math.floor(num); // Round down

    elem.value = num; //reset fractional numbers, check nothing odd happened
    elem.style.background = "#fff";

    return num;
}


//Calculates and returns the cost of adding a certain number of workers at the present population
function calcWorkerCost(num, curPop){
    if (curPop === undefined) { curPop = population.current; }
    return (20*num) + calcArithSum(0.01, curPop, curPop + num);
}
function calcZombieCost(num){ return calcWorkerCost(num, curCiv.zombie.owned)/5; }


// Create a cat
function spawnCat()
{
    ++civData.cat.owned;
    gameLog("Found a cat!");
}

// Creates or destroys workers
function spawn(num){
    var jobObj = civData.unemployed;
    if (num == "custom" ) { num =  getCustomNumber(jobObj); }
    if (num == "-custom") { num = -getCustomNumber(jobObj); }

    // Find the most workers we can spawn
    num = Math.max(num, -jobObj.owned);  // Cap firing by # in that job.
    num = Math.min(num,logSearchFn(calcWorkerCost,curCiv.food.owned));

    // Apply population cap, and only allow whole workers.
    num = Math.min(num, (population.cap - population.current));

    // Update numbers and resource levels
    curCiv.food.owned -= calcWorkerCost(num);

    // New workers enter as farmers, but we only destroy idle ones.
    if (num >= 0) { civData.farmer.owned += num; }
    else          { jobObj.owned += num; }

    population.current += num;

    //This is intentionally independent of the number of workers spawned
    if (Math.random() * 100 < 1 + (civData.lure.owned)) { spawnCat(); }

    updateResourceTotals(); //update with new resource number
    updatePopulation(); //Run through the population->job update cycle
    updatePopulationUI();
    
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
    var jobList=["unemployed","blacksmith","tanner","miner","woodcutter",
        "cleric","cavalry","soldier","healer","labourer","farmer"];

    for (modNum=0;modNum<modList.length;++modNum)
    {
        for (jobNum=0;jobNum<jobList.length;++jobNum)
        {
            if (curCiv[jobList[jobNum]+modList[modNum]].owned > 0) 
                { return {job:  jobList[jobNum]+modList[modNum], 
                          base: jobList[jobNum]}; }
        }
    }
    // These don't have Ill variants at the moment.
    if (civData.cavalryParty.owned > 0) { return {job: civData.cavalryParty.id, base: civData.cavalryParty.source}; }
    if (civData.soldierParty.owned > 0) { return {job: civData.soldierParty.id, base: civData.soldierParty.source}; }

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
        if (!target.job) { return i; }

        --curCiv[target.job].owned;

        ++curCiv.corpses.owned; //Increments corpse number
        //Workers dying may trigger Book of the Dead
        if (civData.book.owned) { curCiv.piety.owned += 10; }
    }

    return num;
}

function doStarve() {
    var corpsesEaten, num_starve;
    if (civData.food.owned < 0 && civData.waste.owned) // Workers eat corpses if needed
    {
        corpsesEaten = Math.min(civData.corpses.owned,-civData.food.owned);
        civData.corpses.owned -= corpsesEaten;
        civData.food.owned += corpsesEaten;
    }

    if (civData.food.owned < 0) { // starve if there's not enough food.
        //xxx This is very kind.  Only 0.1% deaths no matter how big the shortage?
        num_starve = starve(Math.ceil(population.current/1000));
        if (num_starve == 1) { gameLog("A worker starved to death"); }
        if (num_starve > 1) { gameLog(prettify(num_starve) + " workers starved to death"); }
        updateJobButtons();
        mood(-0.01);
        civData.food.owned = 0;
        updatePopulation(); //Called because starve() doesn't. May just change starve()?
    }
}


// Creates or destroys zombies
// Pass a positive number to create, a negative number to destroy.
// Only idle zombies can be destroyed.
// If it can't create/destroy as many as requested, does as many as it can.
// Pass Infinity/-Infinity as the num to get the max possible.
// Pass "custom" or "-custom" to use the custom increment.
// Returns the actual number created or destroyed (negative if destroyed).
function raiseDead(num){
    if (num === undefined) { num = 1; }
    if (num == "custom") { num = getCustomNumber(civData.unemployed); }
    if (num == "-custom") { num = -getCustomNumber(civData.unemployed); }

    // Find the most zombies we can raise
    num = Math.min(num, curCiv.corpses.owned);
    num = Math.max(num, -curCiv.zombie.owned);  // Cap firing by # in that job.
    num = Math.min(num,logSearchFn(calcZombieCost,curCiv.piety.owned));

    //Update numbers and resource levels
    curCiv.piety.owned -= calcZombieCost(num);
    curCiv.zombie.owned += num;
    civData.unemployed.owned += num;
    curCiv.corpses.owned -= num;

    //Notify player
    if      (num ==  1) { gameLog("A corpse rises, eager to do your bidding."); } 
    else if (num  >  1) { gameLog("The corpses rise, eager to do your bidding."); }
    else if (num == -1) { gameLog("A zombie crumples to the ground, inanimate."); }
    else if (num  < -1) { gameLog("The zombies fall, mere corpses once again."); }

    updatePopulation(); //Run through population->jobs cycle to update page with zombie and corpse totals
    updatePopulationUI();
    updateResourceTotals(); //Update any piety spent

    return num;
}

function summonShade(){
    if (curCiv.enemySlain.owned <= 0) { return 0; }
    if (!payFor(civData.summonShade.require)) { return 0; }

    var num = Math.ceil(curCiv.enemySlain.owned/4 + (Math.random() * curCiv.enemySlain.owned/4));
    curCiv.enemySlain.owned -= num;
    civData.shade.owned += num;

    return num;
}

//Deity Domains upgrades
function selectDeity(domain,force){
    if (!force) {
        if (curCiv.piety.owned < 500) { return; } // Can't pay
        curCiv.piety.owned -= 500;
    }
    curCiv.deities[0].domain = domain;

    document.getElementById(domain+"Upgrades").style.display = "inline";
    document.getElementById("deityDomains").style.display = "none";
    makeDeitiesTables();
}

function digGraves(num){
    //Creates new unfilled graves.
    curCiv.grave.owned += 100 * num;
    updatePopulationUI(); //Update page with grave numbers
}

//Selects a random healthy worker based on their proportions in the current job distribution.
//xxx Doesn't currently pick from the army
function randomHealthyWorker(){
    var num = Math.random() * population.healthy;
    var chance = 0;
    var i;
    for (i=0;i<killable.length;++i)
    {
        chance += civData[killable[i].id].owned;
        if (chance > num) { return killable[i].id; }
    }

    return "";
}

//Selects a random worker, kills them, and then adds a random resource
function wickerman(){
    //Select a random worker
    var job = randomHealthyWorker();
    if (!job) { return; }

    //Pay the price
    if (!payFor(civData.wickerman.require)) { return; }
    --civData[job].owned;

    //Select a random physical resource
    var resource = "";
    var msg;
    var num = Math.random();
    if (num < 1/8){
        resource = "food";
        msg = "The crops are abundant!";
    } else if (num < 2/8){
        resource = "wood";
        msg = "The trees grow stout!";
    } else if (num < 3/8){
        resource = "stone";
        msg = "The stone splits easily!";
    } else if (num < 4/8){
        resource = "skins";
        msg = "The animals are healthy!";
    } else if (num < 5/8){
        resource = "herbs";
        msg = "The gardens flourish!";
    } else if (num < 6/8){
        resource = "ore";
        msg = "A new vein is struck!";
    } else if (num < 7/8){
        resource = "leather";
        msg = "The tanneries are productive!";
    } else {
        resource = "metal";
        msg = "The steel runs pure.";
    }
    var qty = Math.floor(Math.random() * 1000);
    //xxx Note that this presumes the price is 500 wood.
    if (resource == "wood") { qty = (qty/2) + 500; } // Guaranteed to at least restore initial cost.

    curCiv[resource].owned += Math.floor(Math.random() * 1000);

    gameLog("Burned a " + getJobSingular(job) + ". " + msg);
    updateResourceTotals(); //Adds new resources
    updatePopulation(); //Removes killed worker
    updatePopulationUI();
}

function walk(increment){
    if (increment === undefined) { increment = 1; }
    if (increment === false) { increment = 0; curCiv.walkTotal = 0; }

    curCiv.walkTotal += increment;
    document.getElementById("walkStat").innerHTML = prettify(curCiv.walkTotal);
    document.getElementById("ceaseWalk").disabled = (curCiv.walkTotal === 0);
    setElemDisplay(document.getElementById("walkGroup"),(curCiv.walkTotal > 0));
}

function doWalk() {
    var i;
    var target = "";
    if (curCiv.walkTotal <= 0) { return; }

    for (i=0;i<curCiv.walkTotal;i++){
        target = randomHealthyWorker();
        if (!target){
            curCiv.walkTotal = 0;
            document.getElementById("ceaseWalk").disabled = true;
            break;
        } 
        --civData.current;
        --civData[target].owned;
    }
    updatePopulation();
    updatePopulationUI();
}

// Give a temporary bonus based on the number of cats owned.
function pestControl(length){
    if (length === undefined) { length = 10; }
    if (curCiv.piety.owned < (10 * length)) { return; }
    curCiv.piety.owned -= (10 * length);
    curCiv.pestTimer = length * civData.cat.owned;
    gameLog("The vermin are exterminated.");
}


/* Iconoclasm */

function iconoclasmList(){
    var i;
    //Lists the deities for removing
    if (curCiv.piety.owned >= 1000){
        curCiv.piety.owned -= 1000;
        updateResourceTotals();
        document.getElementById("iconoclasm").disabled = true;
        var append = "<br />";
        for (i=1;i<curCiv.deities.length;++i){
            append += '<button onclick="iconoclasm(' + i + ')">';
            append += curCiv.deities[i].name;
            append += '</button><br />';
        }
        append += '<br /><button onclick=\'iconoclasm("cancel")\'>Cancel</button>';
        document.getElementById("iconoclasmList").innerHTML = append;
    }
}

function iconoclasm(index){
    //will splice a deity from the deityArray unless the user has cancelled
    document.getElementById("iconoclasmList").innerHTML = "";
    document.getElementById("iconoclasm").disabled = false;
    if ((index == "cancel")||(index >= curCiv.deities.length)){
        //return the piety
        curCiv.piety.owned += 1000;
        return;
    } 

    //give gold
    curCiv.gold.owned += Math.floor(Math.pow(curCiv.deities[index].maxDev,1/1.25));

    //remove the deity
    curCiv.deities.splice(index,1);

    makeDeitiesTables();
}

/* Enemies */

function summonMob(mobtype){
    //Calls spawnMob() if the player has the correct resources (was used by Deities of Battle)
    if (curCiv.piety.owned >= 100){
        curCiv.piety.owned -= 100;
        spawnMob(mobtype);
    }
}

function spawnMob(mobtype){
    var max_mob = 0, num_mob = 0, pct_sge = 0, num_sge = 0, msg="";
    //Creates enemies based on current population
    if (mobtype == "wolf"){
        max_mob = (population.current / 50);
        pct_sge = 0; // Wolves don't use siege engines.
    }
    if(mobtype == "bandit"){
        max_mob = ((population.current + curCiv.zombie.owned) / 50);
        pct_sge = Math.random();
    }
    if (mobtype == "barbarian"){
        max_mob = ((population.current + curCiv.zombie.owned) / 50);
        pct_sge = Math.random();
    }
    num_mob = Math.ceil(max_mob*Math.random());
    num_sge = Math.floor(pct_sge * num_mob/100);

    if (num_mob === 0) { return num_mob; }  // Nobody came

    civData[mobtype].owned += num_mob;
    civData.esiege.owned += num_sge;

    msg = prettify(num_mob) + " " + civData[mobtype].plural + " attacked";  //xxx L10N
    if (num_sge > 0) { 
        msg += ", with " + prettify(num_sge) + " siege engines";  //xxx L10N
        document.getElementById("esiegeRow").style.display = "table-row";
    } 
    gameLog(msg);
    document.getElementById(mobtype+"Row").style.display = "table-row";
    updateJobButtons(); //updates page with numbers

    return num_mob;
}

function smiteMob(mobtype) {
    if (!isValid(civData[mobtype].owned) || civData[mobtype].owned <= 0) { return 0; }
    var num = Math.min(civData[mobtype].owned,Math.floor(curCiv.piety.owned/100));
    curCiv.piety.owned -= num * 100;
    civData[mobtype].owned -= num;
    curCiv.corpses.owned += num; //xxx Should dead wolves count as corpses?
    curCiv.enemySlain.owned += num;
    if (civData.throne.owned) { curCiv.throneCount += num; }
    if (civData.book.owned) { curCiv.piety.owned += num * 10; }
    gameLog("Struck down " + num + " " + mobtype); // L10N
    return num;
}

function smite(){
    smiteMob("barbarian");
    smiteMob("bandit");
    smiteMob("wolf");
    updateResourceTotals();
    updateJobButtons();
}

/* War Functions */

function invade(ecivtype){
    //invades a certain type of civilisation based on the button clicked
    raiding.raiding = true;
    raiding.last = ecivtype;

    raiding.epop = civSizes.getMaxPop(ecivtype) + 1;
    // If no max pop, use 2x min pop. xxx Assumes -1 sentinal value
    if (raiding.epop <= 0 ) { raiding.epop = civSizes[civSizes[ecivtype]].min_pop * 2; }
    if (curCiv.gloryTimer > 0) { raiding.epop *= 2; } //doubles soldiers fought

    // 5-25% of enemy population is soldiers.
    civData.esoldier.owned += (raiding.epop/20) + Math.floor(Math.random() * (raiding.epop/5));
    civData.efort.owned += Math.floor(Math.random() * (raiding.epop/5000));

    // Glory redoubles rewards (doubled here because doubled already above)
    var baseLoot = raiding.epop / (1 + (curCiv.gloryTimer <= 0));

    // Set rewards of land and other random plunder.
    raiding.plunderLoot = {
        food    : Math.round(baseLoot * Math.random()),
        wood    : Math.round(baseLoot * Math.random()),
        stone   : Math.round(baseLoot * Math.random()),
        skins   : Math.round(baseLoot * Math.random()),
        herbs   : Math.round(baseLoot * Math.random()),
        ore     : Math.round(baseLoot * Math.random()),
        leather : Math.round(baseLoot * Math.random()),
        metal   : Math.round(baseLoot * Math.random()),
        freeLand: Math.round(baseLoot * (1 + (civData.administration.owned)))
    };

    //Hides raid buttons until the raid is finished
    setElemDisplay(document.getElementById("raidGroup"),civData.standard.owned && !raiding.raiding);
}
function onInvade(event) { return invade(dataset(event.target,"civtype")); }

function plunder(){
    var plunderMsg = "";

    //add loot
    updateResourceTotals();
    payFor(raiding.plunderLoot,-1);  // We pay for -1 of these to receive them.

    // create message to notify player
    plunderMsg = civSizes[civSizes[raiding.last]].name + " defeated! ";
    plunderMsg += "Plundered " + getReqText(raiding.plunderLoot) + ". ";
    gameLog(plunderMsg); 

    raiding.plunderLoot = {};
    raiding.raiding = false; //ends the raid state
    raiding.victory = false; //ends the victory state
    raiding.epop = 0;
    raiding.last = "";
    document.getElementById("victoryGroup").style.display = "none";
}

function glory(time){
    if (time === undefined) { time = 180; }
    if (curCiv.piety.owned >= 1000){ //check it can be bought
        curCiv.gloryTimer = time; //set timer
        curCiv.piety.owned -= 1000; //decrement resources
        document.getElementById("gloryTimer").innerHTML = curCiv.gloryTimer; //update timer to player
        document.getElementById("gloryGroup").style.display = "block";
    }
}

function grace(delta){
    if (delta === undefined) { delta = 0.1; }
    if (curCiv.piety.owned >= curCiv.graceCost){
        curCiv.piety.owned -= curCiv.graceCost;
        curCiv.graceCost = Math.floor(curCiv.graceCost * 1.2);
        document.getElementById("graceCost").innerHTML = prettify(curCiv.graceCost);
        mood(delta);
        updateResourceTotals();
        updateHappiness();
    }
}

function mood(delta){
    //Changes and updates happiness given a delta value
    if (population.current + curCiv.zombie.owned > 0) { //dividing by zero is bad for hive
        //calculates zombie proportion (zombies do not become happy or sad)
        var fraction = population.current / (population.current + curCiv.zombie.owned);
        //alters happiness
        efficiency.happiness += delta * fraction;
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
        wonder.building = true;
        renameWonder();
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
    var lowItem = false;
    if      (curCiv.food.owned    < 1) { lowItem = civData.food.name; }
    else if (curCiv.wood.owned    < 1) { lowItem = civData.wood.name; }
    else if (curCiv.stone.owned   < 1) { lowItem = civData.stone.name; }
    else if (curCiv.skins.owned   < 1) { lowItem = civData.skins.name; }
    else if (curCiv.herbs.owned   < 1) { lowItem = civData.herbs.name; }
    else if (curCiv.ore.owned     < 1) { lowItem = civData.ore.name; }
    else if (curCiv.leather.owned < 1) { lowItem = civData.leather.name; }
    else if (curCiv.piety.owned   < 1) { lowItem = civData.piety.name; }
    else if (curCiv.metal.owned   < 1) { lowItem = civData.metal.name; }

    if (lowItem)
        { document.getElementById("limited").innerHTML = " by low " + lowItem; }
}

/* Trade functions */

function tradeTimer(){
    //first set timer length
    trader.timer = 10;
    //add the upgrades
    if (civData.currency.owned) { trader.timer += 5; }
    if (civData.commerce.owned) { trader.timer += 5; }
    if (civData.stay.owned) { trader.timer += 5; }

    //then set material and requested amount
    var tradeItems =   // Item and base amount
        [{material : civData.food,         requested : 5000 },
        { material : civData.wood,         requested : 5000 },
        { material : civData.stone,     requested : 5000 },
        { material : civData.skins,     requested :  500 },
        { material : civData.herbs,     requested :  500 },
        { material : civData.ore,         requested :  500 },
        { material : civData.leather,     requested :  250 },
        { material : civData.metal,     requested :  250 }];

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
    if (!trader.material || (trader.material.owned < trader.requested)) {
        gameLog("Not enough resources to trade.");
        return;
    }

    //subtract resources, add gold
    trader.material.owned -= trader.requested;
    ++curCiv.gold.owned;
    updateResourceTotals();
    gameLog("Traded " + trader.requested + " " + trader.material.name);
}

function buy(materialId){
    var material = civData[materialId];
    if (curCiv.gold.owned < 1) { return; }
    --curCiv.gold.owned;

    if (material == civData.food    || material == civData.wood  || material == civData.stone) { material.owned += 5000; }
    if (material == civData.skins   || material == civData.herbs || material == civData.ore)   { material.owned +=  500; }
    if (material == civData.leather || material == civData.metal)                      { material.owned +=  250; }

    updateResourceTotals();
}

function speedWonder(){
    if (curCiv.gold.owned < 100) { return; }
    curCiv.gold.owned -= 100;

    wonder.progress += 1 / (Math.pow(1.5,wonder.total));
    wonder.rushed = true;
    updateWonder();
}

// Game infrastructure functions

function handleStorageError(err)
{
    var msg;
    if ((err instanceof DOMException) && (err.code == DOMException.SECURITY_ERR))
        { msg = "Browser security settings blocked access to local storage."; }
    else 
        { msg = "Cannot access localStorage - browser may not support localStorage, or storage may be corrupt"; }
    console.log(err.toString());
    console.log(msg);
}

// Load in saved data
function load(loadType){
    //define load variables
    var loadVar = {},
        loadVar2 = {},
        settingsVar = {};
        
    if (loadType === "cookie"){
        //check for cookies
        if (read_cookie(saveTag) && read_cookie(saveTag2)){
            //set variables to load from
            loadVar = read_cookie(saveTag);
            loadVar2 = read_cookie(saveTag2);
            loadVar = mergeObj(loadVar, loadVar2);
            loadVar2 = undefined;
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
        var settingsString;
        try {
            settingsString = localStorage.getItem(saveSettingsTag);
            string1 = localStorage.getItem(saveTag);
            string2 = localStorage.getItem(saveTag2);

            if (!string1) {
                console.log("Unable to find variables in localStorage. Attempting to load cookie.");
                return load("cookie");
            }

        } catch(err) {
            if (!string1) { // It could be fine if string2 or settingsString fail.
                handleStorageError(err);
                return load("cookie");
            }
        }
        
        // Try to parse the strings
        if (string1) { try { loadVar  = JSON.parse(string1); } catch(ignore){} }
        if (string2) { try { loadVar2 = JSON.parse(string1); } catch(ignore){} }
        if (settingsString) { try { settingsVar = JSON.parse(settingsString); } catch(ignore){} }

        // If there's a second string (old save game format), merge it in.
        if (loadVar2) { loadVar = mergeObj(loadVar, loadVar2); loadVar2 = undefined; }

        if (!loadVar) {
            console.log("Unable to parse variables in localStorage. Attempting to load cookie.");
            return load("cookie");
        }

        //notify user
        gameLog("Loaded saved game from localStorage");
    }
    
    if (loadType === "import"){
        //take the import string, decompress and parse it
        var compressed = document.getElementById("impexpField").value;
        var decompressed = LZString.decompressFromBase64(compressed);
        var revived = JSON.parse(decompressed);
        //set variables to load from
        loadVar = revived[0];
        if (isValid(revived[1])) {
            loadVar2 = revived[1];
            loadVar = mergeObj(loadVar, loadVar2);
            loadVar2 = undefined;
        }
        //notify user
        gameLog("Imported saved game");
        //close import/export dialog
        //impexp();
    }

    // Refuse to load saved games from future versions.
    var saveVersion = new VersionData(1,0,0,"legacy");
    saveVersion = mergeObj(saveVersion,loadVar.versionData);
    if (saveVersion.toNumber() > versionData.toNumber)
    {
        var alertStr = "Cannot load; saved game version " + saveVersion + " is newer than game version " + versionData;
        console.log(alertStr);
        alert(alertStr);
        return false;
    }

    console.log("Loading save game version " + saveVersion.major +
        "." + saveVersion.minor + "." + saveVersion.sub + "(" + saveVersion.mod + ").");
    
    // BACKWARD COMPATIBILITY SECTION //////////////////
    // v1.1.35: eliminated 2nd variable
    
    // v1.1.13: population.corpses moved to corpses.total
    if (!isValid(loadVar.corpses)) { loadVar.corpses = {}; }
    if (isValid(loadVar.population) && isValid(loadVar.population.corpses)) { 
        if (!isValid(loadVar.corpses.total)) { 
            loadVar.corpses.total = loadVar.population.corpses; 
        }
        delete loadVar.population.corpses; 
    }
    // v1.1.17: population.apothecaries moved to population.healers 
    if (isValid(loadVar.population) && isValid(loadVar.population.apothecaries)) { 
        if (!isValid(loadVar.population.healers)) { 
            loadVar.population.healers = loadVar.population.apothecaries; 
        }
        delete loadVar.population.apothecaries; 
    }

    // v1.1.28: autosave changed to a bool
    loadVar.autosave = (loadVar.autosave !== false && loadVar.autosave !== "off");

    // v1.1.29: 'deity' upgrade renamed to 'worship'
    if (isValid(loadVar.upgrades) && isValid(loadVar.upgrades.deity)) { 
        if (!isValid(loadVar.upgrades.worship)) { 
            loadVar.upgrades.worship = loadVar.upgrades.deity; 
        }
        delete loadVar.upgrades.deity;
    }
    // v1.1.30: Upgrade flags converted from int to bool (should be transparent)
    // v1.1.31: deity.devotion moved to devotion.total.
    if (!isValid(loadVar.devotion)) { loadVar.devotion = {}; }
    if (isValid(loadVar.deity) && isValid(loadVar.deity.devotion)) { 
        if (!isValid(loadVar.devotion.total)) { 
            loadVar.devotion.total = loadVar.deity.devotion; 
        }
        delete loadVar.deity.devotion; 
    }
    // v1.1.33: Achievement flags converted from int to bool (should be transparent)
    // v1.1.33: upgrades.deityType no longer used
    if (isValid(loadVar.upgrades)) { delete loadVar.upgrades.deityType; }

    // v1.1.34: Most efficiency values now recomputed from base values.
    loadVar.efficiency = {happiness: loadVar.efficiency.happiness };
    
    // v1.1.38: Most assets moved to curCiv substructure
    if (!isValid(loadVar.curCiv)) { loadVar.curCiv = {
        civName: loadVar.civName,
        rulerName: loadVar.rulerName,

        // Migrate resources
        food : { owned:loadVar.food.total, net:(loadVar.food.net||0) },
        wood : { owned:loadVar.wood.total, net:(loadVar.wood.net||0) },
        stone : { owned:loadVar.stone.total, net:(loadVar.stone.net||0) },
        skins : { owned:loadVar.skins.total },
        herbs : { owned:loadVar.herbs.total },
        ore : { owned:loadVar.ore.total },
        leather : { owned:loadVar.leather.total },
        metal : { owned:loadVar.metal.total },
        piety : { owned:loadVar.piety.total },
        gold : { owned:loadVar.gold.total },
        corpses : { owned:loadVar.corpses.total },
        devotion : { owned:loadVar.devotion.total },

        // land (total land) is now stored as free land, so do that calculation.
        freeLand: { owned: loadVar.land - ( loadVar.tent.total + loadVar.whut.total + loadVar.cottage.total 
        + loadVar.house.total + loadVar.mansion.total + loadVar.barn.total + loadVar.woodstock.total 
        + loadVar.stonestock.total + loadVar.tannery.total + loadVar.smithy.total + loadVar.apothecary.total 
        + loadVar.temple.total + loadVar.barracks.total + loadVar.stable.total + loadVar.mill.total 
        + loadVar.graveyard.total + loadVar.fortification.total + loadVar.battleAltar.total 
        + loadVar.fieldsAltar.total + loadVar.underworldAltar.total + loadVar.catAltar.total) },

        // Migrate buildings
        tent : { owned:loadVar.tent.total },
        // Hut ID also changed from 'whut' to 'hut'.
        hut : { owned:loadVar.whut.total },
        cottage : { owned:loadVar.cottage.total },
        house : { owned:loadVar.house.total },
        mansion : { owned:loadVar.mansion.total },
        barn : { owned:loadVar.barn.total },
        woodstock : { owned:loadVar.woodstock.total },
        stonestock : { owned:loadVar.stonestock.total },
        tannery : { owned:loadVar.tannery.total },
        smithy : { owned:loadVar.smithy.total },
        apothecary : { owned:loadVar.apothecary.total },
        temple : { owned:loadVar.temple.total },
        barracks : { owned:loadVar.barracks.total },
        stable : { owned:loadVar.stable.total },
        mill : { owned:loadVar.mill.total },
        graveyard : { owned:loadVar.graveyard.total },
        fortification : { owned:loadVar.fortification.total },
        battleAltar : { owned:loadVar.battleAltar.total },
        fieldsAltar : { owned:loadVar.fieldsAltar.total },
        underworldAltar : { owned:loadVar.underworldAltar.total },
        catAltar : { owned:loadVar.catAltar.total }
    }; }

    if (isValid(loadVar.achievements)) {
        // Migrate upgrades
        loadVar.curCiv.skinning = { owned:loadVar.upgrades.skinning };
        loadVar.curCiv.harvesting = { owned:loadVar.upgrades.harvesting };
        loadVar.curCiv.prospecting = { owned:loadVar.upgrades.prospecting };
        loadVar.curCiv.domestication = { owned:loadVar.upgrades.domestication };
        loadVar.curCiv.ploughshares = { owned:loadVar.upgrades.ploughshares };
        loadVar.curCiv.irrigation = { owned:loadVar.upgrades.irrigation };
        loadVar.curCiv.butchering = { owned:loadVar.upgrades.butchering };
        loadVar.curCiv.gardening = { owned:loadVar.upgrades.gardening };
        loadVar.curCiv.extraction = { owned:loadVar.upgrades.extraction };
        loadVar.curCiv.flensing = { owned:loadVar.upgrades.flensing };
        loadVar.curCiv.macerating = { owned:loadVar.upgrades.macerating };
        loadVar.curCiv.croprotation = { owned:loadVar.upgrades.croprotation };
        loadVar.curCiv.selectivebreeding = { owned:loadVar.upgrades.selectivebreeding };
        loadVar.curCiv.fertilisers = { owned:loadVar.upgrades.fertilisers };
        loadVar.curCiv.masonry = { owned:loadVar.upgrades.masonry };
        loadVar.curCiv.construction = { owned:loadVar.upgrades.construction };
        loadVar.curCiv.architecture = { owned:loadVar.upgrades.architecture };
        loadVar.curCiv.tenements = { owned:loadVar.upgrades.tenements };
        loadVar.curCiv.slums = { owned:loadVar.upgrades.slums };
        loadVar.curCiv.granaries = { owned:loadVar.upgrades.granaries };
        loadVar.curCiv.palisade = { owned:loadVar.upgrades.palisade };
        loadVar.curCiv.weaponry = { owned:loadVar.upgrades.weaponry };
        loadVar.curCiv.shields = { owned:loadVar.upgrades.shields };
        loadVar.curCiv.horseback = { owned:loadVar.upgrades.horseback };
        loadVar.curCiv.wheel = { owned:loadVar.upgrades.wheel };
        loadVar.curCiv.writing = { owned:loadVar.upgrades.writing };
        loadVar.curCiv.administration = { owned:loadVar.upgrades.administration };
        loadVar.curCiv.codeoflaws = { owned:loadVar.upgrades.codeoflaws };
        loadVar.curCiv.mathematics = { owned:loadVar.upgrades.mathematics };
        loadVar.curCiv.aesthetics = { owned:loadVar.upgrades.aesthetics };
        loadVar.curCiv.civilservice = { owned:loadVar.upgrades.civilservice };
        loadVar.curCiv.feudalism = { owned:loadVar.upgrades.feudalism };
        loadVar.curCiv.guilds = { owned:loadVar.upgrades.guilds };
        loadVar.curCiv.serfs = { owned:loadVar.upgrades.serfs };
        loadVar.curCiv.nationalism = { owned:loadVar.upgrades.nationalism };
        loadVar.curCiv.worship = { owned:loadVar.upgrades.worship };
        loadVar.curCiv.lure = { owned:loadVar.upgrades.lure };
        loadVar.curCiv.companion = { owned:loadVar.upgrades.companion };
        loadVar.curCiv.comfort = { owned:loadVar.upgrades.comfort };
        loadVar.curCiv.blessing = { owned:loadVar.upgrades.blessing };
        loadVar.curCiv.waste = { owned:loadVar.upgrades.waste };
        loadVar.curCiv.stay = { owned:loadVar.upgrades.stay };
        loadVar.curCiv.riddle = { owned:loadVar.upgrades.riddle };
        loadVar.curCiv.throne = { owned:loadVar.upgrades.throne };
        loadVar.curCiv.lament = { owned:loadVar.upgrades.lament };
        loadVar.curCiv.book = { owned:loadVar.upgrades.book };
        loadVar.curCiv.feast = { owned:loadVar.upgrades.feast };
        loadVar.curCiv.secrets = { owned:loadVar.upgrades.secrets };
        loadVar.curCiv.standard = { owned:loadVar.upgrades.standard };
        loadVar.curCiv.trade = { owned:loadVar.upgrades.trade };
        loadVar.curCiv.currency = { owned:loadVar.upgrades.currency };
        loadVar.curCiv.commerce = { owned:loadVar.upgrades.commerce };
    }
    if (isValid(loadVar.achievements)) {
        // Migrate achievements
        loadVar.curCiv.hamletAch = { owned:loadVar.achievements.hamlet };
        loadVar.curCiv.villageAch = { owned:loadVar.achievements.village };
        loadVar.curCiv.smallTownAch = { owned:loadVar.achievements.smallTown };
        loadVar.curCiv.largeTownAch = { owned:loadVar.achievements.largeTown };
        loadVar.curCiv.smallCityAch = { owned:loadVar.achievements.smallCity };
        loadVar.curCiv.largeCityAch = { owned:loadVar.achievements.largeCity };
        loadVar.curCiv.metropolisAch = { owned:loadVar.achievements.metropolis };
        loadVar.curCiv.smallNationAch = { owned:loadVar.achievements.smallNation };
        loadVar.curCiv.nationAch = { owned:loadVar.achievements.nation };
        loadVar.curCiv.largeNationAch = { owned:loadVar.achievements.largeNation };
        loadVar.curCiv.empireAch = { owned:loadVar.achievements.empire };
        loadVar.curCiv.raiderAch = { owned:loadVar.achievements.raider };
        loadVar.curCiv.engineerAch = { owned:loadVar.achievements.engineer };
        loadVar.curCiv.dominationAch = { owned:loadVar.achievements.domination };
        loadVar.curCiv.hatedAch = { owned:loadVar.achievements.hated };
        loadVar.curCiv.lovedAch = { owned:loadVar.achievements.loved };
        loadVar.curCiv.catAch = { owned:loadVar.achievements.cat };
        loadVar.curCiv.glaringAch = { owned:loadVar.achievements.glaring };
        loadVar.curCiv.clowderAch = { owned:loadVar.achievements.clowder };
        loadVar.curCiv.battleAch = { owned:loadVar.achievements.battle };
        loadVar.curCiv.catsAch = { owned:loadVar.achievements.cats };
        loadVar.curCiv.fieldsAch = { owned:loadVar.achievements.fields };
        loadVar.curCiv.underworldAch = { owned:loadVar.achievements.underworld };
        loadVar.curCiv.fullHouseAch = { owned:loadVar.achievements.fullHouse };
        // ID 'plague' changed to 'plagued'.
        loadVar.curCiv.plaguedAch = { owned:loadVar.achievements.plague };
        loadVar.curCiv.ghostTownAch = { owned:loadVar.achievements.ghostTown };
        loadVar.curCiv.wonderAch = { owned:loadVar.achievements.wonder };
        loadVar.curCiv.sevenAch = { owned:loadVar.achievements.seven };
        loadVar.curCiv.merchantAch = { owned:loadVar.achievements.merchant };
        loadVar.curCiv.rushedAch = { owned:loadVar.achievements.rushed };
        loadVar.curCiv.neverclickAch = { owned:loadVar.achievements.neverclick };
    }
    if (isValid(loadVar.population)) {
        // Migrate population
        loadVar.curCiv.cat = { owned:loadVar.population.cats };
        loadVar.curCiv.zombie = { owned:loadVar.population.zombies };
        loadVar.curCiv.grave = { owned:loadVar.population.graves };
        loadVar.curCiv.unemployed = { owned:loadVar.population.unemployed };
        loadVar.curCiv.farmer = { owned:loadVar.population.farmers };
        loadVar.curCiv.woodcutter = { owned:loadVar.population.woodcutters };
        loadVar.curCiv.miner = { owned:loadVar.population.miners };
        loadVar.curCiv.tanner = { owned:loadVar.population.tanners };
        loadVar.curCiv.blacksmith = { owned:loadVar.population.blacksmiths };
        loadVar.curCiv.healer = { owned:loadVar.population.healers };
        loadVar.curCiv.cleric = { owned:loadVar.population.clerics };
        loadVar.curCiv.labourer = { owned:loadVar.population.labourers };
        loadVar.curCiv.soldier = { owned:loadVar.population.soldiers };
        loadVar.curCiv.cavalry = { owned:loadVar.population.cavalry };
        loadVar.curCiv.soldierParty = { owned:loadVar.population.soldiersParty };
        loadVar.curCiv.cavalryParty = { owned:loadVar.population.cavalryParty };
        loadVar.curCiv.siege = { owned:loadVar.population.siege };
        loadVar.curCiv.esoldier = { owned:loadVar.population.esoldiers };
        loadVar.curCiv.efort = { owned:loadVar.population.eforts };
        loadVar.curCiv.unemployedIll = { owned:loadVar.population.unemployedIll };
        loadVar.curCiv.farmerIll = { owned:loadVar.population.farmersIll };
        loadVar.curCiv.woodcutterIll = { owned:loadVar.population.woodcuttersIll };
        loadVar.curCiv.minerIll = { owned:loadVar.population.minersIll };
        loadVar.curCiv.tannerIll = { owned:loadVar.population.tannersIll };
        loadVar.curCiv.blacksmithIll = { owned:loadVar.population.blacksmithsIll };
        loadVar.curCiv.healerIll = { owned:loadVar.population.healersIll };
        loadVar.curCiv.clericIll = { owned:loadVar.population.clericsIll };
        loadVar.curCiv.labourerIll = { owned:loadVar.population.labourersIll };
        loadVar.curCiv.soldierIll = { owned:loadVar.population.soldiersIll };
        loadVar.curCiv.cavalryIll = { owned:loadVar.population.cavalryIll };
        loadVar.curCiv.wolf = { owned:loadVar.population.wolves };
        loadVar.curCiv.bandit = { owned:loadVar.population.bandits };
        loadVar.curCiv.barbarian = { owned:loadVar.population.barbarians };
        loadVar.curCiv.esiege = { owned:loadVar.population.esiege };
        loadVar.curCiv.enemySlain = { owned:loadVar.population.enemiesSlain };
        loadVar.curCiv.shade = { owned:loadVar.population.shades };
    }

    // v1.1.38: Game settings moved to settings object, but we deliberately
    // don't try to migrate them.  'autosave', 'worksafe', and 'fontSize'
    // values from earlier versions will be discarded.

    // v1.1.39: Migrate more save fields into curCiv.
    if (isValid(loadVar.resourceClicks)){ 
        loadVar.curCiv.resourceClicks = loadVar.resourceClicks;
        delete loadVar.resourceClicks;
    }
    if (!isValid(loadVar.curCiv.resourceClicks)){
        loadVar.curCiv.resourceClicks = 999; //stops people getting the achievement with an old save version
    }
    if (isValid(loadVar.graceCost)){ 
        loadVar.curCiv.graceCost = loadVar.graceCost;
        delete loadVar.graceCost;
    }
    if (isValid(loadVar.walkTotal)){ 
        loadVar.curCiv.walkTotal = loadVar.walkTotal;
        delete loadVar.walkTotal;
    }

    // v1.1.39: Migrate deities to use IDs.
    if (isValid(loadVar.deityArray))
    {
        loadVar.curCiv.deities = [];
        loadVar.deityArray.forEach(function(row) {
            loadVar.curCiv.deities.unshift({ name: row[1], domain: typeToId(row[2]), maxDev: row[3] });
        });
        delete loadVar.deityArray;
    }

    if (isValid(loadVar.deity))
    {
        loadVar.curCiv.deities.unshift({ name: loadVar.deity.name, domain: typeToId(loadVar.deity.type), maxDev: loadVar.devotion.total });
        delete loadVar.deity;
    }

    // v1.1.39: Settings moved to their own variable
    if (isValid(loadVar.settings))
    {
        settingsVar = loadVar.settings;
        delete loadVar.settings;
    }

    // v1.1.39: Raiding now stores enemy population instead of 'iterations'.
    if (isValid(loadVar.raiding) && isValid(loadVar.raiding.iterations))
    {
        loadVar.raiding.epop = loadVar.raiding.iterations * 20;
        // Plunder calculations now moved to the start of the raid.
        // This should rarely happen, but give a consolation prize.
        loadVar.raiding.plunderLoot = { gold: 1 };
        delete loadVar.raiding.iterations;
    }

    ////////////////////////////////////////////////////

    curCiv = loadVar.curCiv;
    totalBuildings = countTotalBuildings(curCiv);

    if (isValid(loadVar.wonder)){
        wonder = mergeObj(wonder, loadVar.wonder);
    }
    efficiency = mergeObj(efficiency, loadVar.efficiency);

    if (isValid(loadVar.raiding)){
        raiding = mergeObj(raiding, loadVar.raiding);
    }
    if (isValid(loadVar.targetMax)) { targetMax = mergeObj(targetMax, loadVar.targetMax); }

    if (isValid(settingsVar)){ settings = mergeObj(settings,settingsVar); }
 
    mood(0);
    updateRequirements(civData.mill);
    updateRequirements(civData.fortification);
    updateRequirements(civData.battleAltar);
    updateRequirements(civData.fieldsAltar);
    updateRequirements(civData.underworldAltar);
    updateRequirements(civData.catAltar);
    updateResourceTotals();
    updateJobButtons();
    makeDeitiesTables();
    updateDeity();
    updateUpgrades();
    updateTargets();
    updateDevotion();
    updatePartyButtons();
    updateHappiness();
    updateWonder();
    document.getElementById("clicks").innerHTML = prettify(Math.round(curCiv.resourceClicks));
    document.getElementById("civName").innerHTML = curCiv.civName;
    document.getElementById("rulerName").innerHTML = curCiv.rulerName;
    document.getElementById("wonderNameP").innerHTML = wonder.name;
    document.getElementById("wonderNameC").innerHTML = wonder.name;

    return true;
}

function save(savetype){
    var xmlhttp;
    //Create objects and populate them with the variables, these will be 
    //stored in HTML5 localStorage.
    //Cookie-based saves are no longer supported.

    var saveVar = {
        versionData:versionData,
        // Main variables
        curCiv:curCiv,
        efficiency:efficiency,
        wonder:wonder,
        // Saved statuses
        targetMax:targetMax,
        raiding:raiding
    };

    // UI Settings are saved separately.
    var settingsVar = settings;

    ////////////////////////////////////////////////////

    // Handle export
    if (savetype == "export"){
        var savestring = "[" + JSON.stringify(saveVar) + "]";
        var compressed = LZString.compressToBase64(savestring);
        console.log("Compressed save from " + savestring.length + " to " + compressed.length + " characters");
        document.getElementById("impexpField").value = compressed;
        gameLog("Exported game to base64");
        return true;
    }

    //set localstorage
    try {
        // Delete the old cookie-based save to avoid mismatched saves
        deleteCookie(saveTag);
        deleteCookie(saveTag2);

        localStorage.setItem(saveTag, JSON.stringify(saveVar));

        // We always save the game settings.
        localStorage.setItem(saveSettingsTag, JSON.stringify(settingsVar));

        //Update console for debugging, also the player depending on the type of save (manual/auto)
        if (savetype == "auto"){
            console.log("Autosave");
            gameLog("Autosaved");
        } else if (savetype == "manual"){
            alert("Game Saved");
            console.log("Manual Save");
            gameLog("Saved game");
        }
    } catch(err) {
        handleStorageError(err);

        if (savetype == "auto"){
            console.log("Autosave Failed");
            gameLog("Autosave Failed");
        } else if (savetype == "manual"){
            alert("Save Failed!");
            console.log("Save Failed");
            gameLog("Save Failed");
        }
        return false;
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

    return true;
}

function deleteSave(){
    //Deletes the current savegame by setting the game's cookies to expire in the past.
    if (!confirm("Really delete save?")) { return; } //Check the player really wanted to do that.

    try {
        deleteCookie(saveTag);
        deleteCookie(saveTag2);
        localStorage.removeItem(saveTag);
        localStorage.removeItem(saveTag2);
        localStorage.removeItem(saveSettingsTag);
        gameLog("Save Deleted");
    } catch(err) {
        handleStorageError(err);
        alert("Save Deletion Failed!");
    }
}

function renameCiv(newName){
    //Prompts player, uses result as new civName
    while (!newName) {
        newName = prompt("Please name your civilisation",(newName || curCiv.civName || "Woodstock"));
        if ((newName === null)&&(curCiv.civName)) { return; } // Cancelled
    }

    curCiv.civName = newName;
    document.getElementById("civName").innerHTML = curCiv.civName;
}

// Note:  Returns the index (which could be 0), or 'false'.
function haveDeity(name)
{
    var i;
    for (i=0;i<curCiv.deities.length;++i) { 
        if (curCiv.deities[i].name == name) { return i; } 
    }

    return false;
}

function renameRuler(newName){
    if (curCiv.rulerName == "Cheater") { return; } // Reputations suck, don't they?
    //Prompts player, uses result as rulerName
    while (!newName || haveDeity(newName)!==false) {
        newName = prompt("What is your name?",(newName || curCiv.rulerName || "Orteil"));
        if ((newName === null)&&(curCiv.rulerName)) { return; } // Cancelled
        if (haveDeity(newName)!==false) {
            alert("That would be a blasphemy against the deity "+newName+".");
            newName = "";
        }
    }

    curCiv.rulerName = newName;

    document.getElementById("rulerName").innerHTML = curCiv.rulerName;
}

// Looks to see if the deity already exists.  If it does, that deity
// is moved to the first slot, overwriting the current entry, and the
// player's domain is automatically assigned to match (for free).
function renameDeity(newName){
    var i = false;
    while (!newName) {
        // Default to ruler's name.  Hey, despots tend to have big egos.
        newName = prompt("Whom do your people worship?",(newName || curCiv.deities[0].name || curCiv.rulerName));
        if ((newName === null)&&(curCiv.deities[0].name)) { return; } // Cancelled

        // If haveDeity returns a number > 0, the name is used by a legacy deity.
        // This is only allowed when naming (not renaming) the active deity.
        i = haveDeity(newName);
        if (i && curCiv.deities[0].name) { 
            alert("That deity already exists."); 
            newName = "";
        } 
    }

    // Rename the active deity.
    curCiv.deities[0].name = newName;

    // If the name matches a legacy deity, make the legacy deity the active deity.
    if (i) {
        curCiv.deities[0] = curCiv.deities[i]; // Copy to front position
        curCiv.deities.splice(i,1); // Remove from old position
        if (getCurDeityDomain()) { // Does deity have a domain?
            selectDeity(getCurDeityDomain(),true); // Automatically pick that domain.
        }
    }

    makeDeitiesTables();
}

function reset(){
    //Resets the game, keeping some values but resetting most back to their initial values.
    var msg = "Really reset? You will keep past deities and wonders (and cats)"; //Check player really wanted to do that.
    if (!confirm(msg)) { return false; } // declined

    curCiv = {
        civName : curCiv.civName,
        rulerName : curCiv.rulerName,

        cat:curCiv.cat, //Cats always carry over
        zombie: { owned:0 },
        grave: { owned:0 },
        enemySlain: { owned:0 },

        //Pantheon upgrades are permanent across resets
        deities : curCiv.deities,
        lure: curCiv.lure,
        companion: curCiv.companion,
        comfort: curCiv.comfort,
        blessing: curCiv.blessing,
        waste: curCiv.waste,
        stay: curCiv.stay,
        riddle: curCiv.riddle,
        throne: curCiv.throne,
        lament: curCiv.lament,
        book: curCiv.book,
        feast: curCiv.feast,
        secrets: curCiv.secrets,

        hamletAch: curCiv.hamletAch,
        villageAch: curCiv.villageAch,
        smallTownAch: curCiv.smallTownAch,
        largeTownAch: curCiv.largeTownAch,
        smallCityAch: curCiv.smallCityAch,
        largeCityAch: curCiv.largeCityAch,
        metropolisAch: curCiv.metropolisAch,
        smallNationAch: curCiv.smallNationAch,
        nationAch: curCiv.nationAch,
        largeNationAch: curCiv.largeNationAch,
        empireAch: curCiv.empireAch,
        raiderAch: curCiv.raiderAch,
        engineerAch: curCiv.engineerAch,
        dominationAch: curCiv.dominationAch,
        hatedAch: curCiv.hatedAch,
        lovedAch: curCiv.lovedAch,
        catAch: curCiv.catAch,
        glaringAch: curCiv.glaringAch,
        clowderAch: curCiv.clowderAch,
        battleAch: curCiv.battleAch,
        catsAch: curCiv.catsAch,
        fieldsAch: curCiv.fieldsAch,
        underworldAch: curCiv.underworldAch,
        fullHouseAch: curCiv.fullHouseAch,
        plaguedAch: curCiv.plaguedAch,
        ghostTownAch: curCiv.ghostTownAch,
        wonderAch: curCiv.wonderAch,
        sevenAch: curCiv.sevenAch,
        merchantAch: curCiv.merchantAch,
        rushedAch: curCiv.rushedAch,
        neverclickAch: curCiv.neverclickAch,

        resourceClicks : 0, // For NeverClick
        attackCounter : 0, // How long since last attack?
        tradeCounter : 0, // How long since last trader?
        throneCount : 0, // Partial temples from Throne
        pestTimer : 0, // Pest hunting time left
        gloryTimer : 0, // Glory time left
        cureCounter : 0, // Carryover fractional healing
        graceCost : 1000, // Increasing cost to use Grace to increase morale.
        walkTotal : 0 // Sacrifice rate
    };

    // Let each data subpoint re-init.
    //xxx It might be better not to replace the curCiv object above.
    civData.forEach( function(elem){ elem.reset(); });

    // If our current deity is powerless, delete it.
    if (!curCiv.deities[0].maxDev) {
        curCiv.deities.shift();
    }
    // Insert space for a fresh deity.
    curCiv.deities.unshift({ name:"", domain:"", maxDev:0 });

    updateRequirements(curCiv.mill);
    updateRequirements(curCiv.fortification);
    updateRequirements(curCiv.battleAltar);
    updateRequirements(curCiv.fieldsAltar);
    updateRequirements(curCiv.underworldAltar);
    updateRequirements(curCiv.catAltar);
    totalBuildings = countTotalBuildings(curCiv);

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
        rushed:false,
        progress:0
    };

    population = {
        current:0,
        cap:0,
        healthy:0,
        totalSick:0
    };

    efficiency = {
        happiness:1
    };

    raiding = {
        raiding:false,
        victory:false
    };
    document.getElementById("graceCost").innerHTML = prettify(curCiv.graceCost);
    targetMax = "thorp";
    //Update page with all new values
    updateResourceTotals();
    updateUpgrades();
    updateDeity();
    makeDeitiesTables();
    updateDevotion();
    updateTargets();
    updateJobButtons();
    updatePartyButtons();
    updateWonder();
    //Reset upgrades and other interface elements that might have been unlocked
    //xxx Some of this probably isn't needed anymore; the update routines will handle it.
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
    document.getElementById("summonShade").disabled = "true";

    setElemDisplay(document.getElementById("deitySelect"),(curCiv.temple.owned > 0));
    setElemDisplay(document.getElementById("conquestSelect"),(curCiv.barracks.owned > 0));
    setElemDisplay(document.getElementById("tradeSelect"),(curCiv.gold.owned > 0));

    document.getElementById("conquest").style.display = "none";

    document.getElementById("tradeContainer").style.display = "none";
    document.getElementById("tradeUpgradeContainer").style.display = "none";
    document.getElementById("iconoclasmList").innerHTML = "";
    document.getElementById("iconoclasm").disabled = false;
    gameLog("Game Reset"); //Inform player.

    renameCiv();
    renameRuler();

    return true;
}

function doFarmers() {
    var specialChance = civData.food.specialChance + (0.1 * civData.flensing.owned);
    var millMod = 1;
    if (population.current > 0 || curCiv.zombie.owned > 0) { millMod = population.current / (population.current + curCiv.zombie.owned); }
    curCiv.food.net = civData.farmer.owned * (1 + (civData.farmer.efficiency * efficiency.happiness)) * ((curCiv.pestTimer > 0) ? 1.01 : 1) * (1 + (wonder.food/10)) * (1 + curCiv.walkTotal/120) * (1 + curCiv.mill.owned * millMod / 200); //Farmers farm food
    curCiv.food.net -= population.current; //The living population eats food.
    curCiv.food.owned += curCiv.food.net;
    if (civData.skinning.owned && civData.farmer.owned > 0){ //and sometimes get skins
        var num_skins = specialChance * (civData.food.increment + ((civData.butchering.owned) * civData.farmer.owned / 15.0)) * (1 + (wonder.skins/10));
        curCiv.skins.owned += rndRound(num_skins);
    }
}
function doWoodcutters() {
    curCiv.wood.net = civData.woodcutter.owned * (civData.woodcutter.efficiency * efficiency.happiness) * (1 + (wonder.wood/10)); //Woodcutters cut wood
    curCiv.wood.owned += curCiv.wood.net;
    if (civData.harvesting.owned && civData.woodcutter.owned > 0){ //and sometimes get herbs
        var num_herbs = civData.wood.specialChance * (civData.wood.increment + ((civData.gardening.owned) * civData.woodcutter.owned / 5.0)) * (1 + (wonder.wood/10));
        curCiv.herbs.owned += rndRound(num_herbs);
    }
}

function doMiners() {
    var specialChance = civData.stone.specialChance + (civData.macerating.owned ? 0.1 : 0);
    curCiv.stone.net = civData.miner.owned * (civData.miner.efficiency * efficiency.happiness) * (1 + (wonder.stone/10)); //Miners mine stone
    curCiv.stone.owned += curCiv.stone.net;
    if (civData.prospecting.owned && civData.miner.owned > 0){ //and sometimes get ore
        var num_ore = specialChance * (civData.stone.increment + ((civData.extraction.owned) * civData.miner.owned / 5.0)) * (1 + (wonder.ore/10));
        curCiv.ore.owned += rndRound(num_ore);
    }
}

function doBlacksmiths() {
    if (curCiv.ore.owned >= civData.blacksmith.owned * (civData.blacksmith.efficiency * efficiency.happiness)){
        curCiv.metal.owned += civData.blacksmith.owned * (civData.blacksmith.efficiency * efficiency.happiness) * (1 + (wonder.metal/10));
        curCiv.ore.owned -= civData.blacksmith.owned * (civData.blacksmith.efficiency * efficiency.happiness);
    } else if (civData.blacksmith.owned) {
        curCiv.metal.owned += curCiv.ore.owned * (1 + (wonder.metal/10));
        curCiv.ore.owned = 0;
    }
}

function doTanners() {
    if (curCiv.skins.owned >= civData.tanner.owned * (civData.tanner.efficiency * efficiency.happiness)){
        curCiv.leather.owned += civData.tanner.owned * (civData.tanner.efficiency * efficiency.happiness) * (1 + (wonder.leather/10));
        curCiv.skins.owned -= civData.tanner.owned * (civData.tanner.efficiency * efficiency.happiness);
    } else if (civData.tanner.owned) {
        curCiv.leather.owned += curCiv.skins.owned * (1 + (wonder.leather/10));
        curCiv.skins.owned = 0;
    }
}

function doClerics() {
    curCiv.piety.owned += civData.cleric.owned * (civData.cleric.efficiency + (civData.cleric.efficiency * (civData.writing.owned))) * (1 + ((civData.secrets.owned) * (1 - 100/(curCiv.graveyard.owned + 100)))) * efficiency.happiness * (1 + (wonder.piety/10));
}
// Try to heal the specified number of people in the specified job
// Makes them sick if the number is negative.
function heal(job,num)
{
    if (!isValid(job) || !job) { return 0; }
    if (num === undefined) { num = 1; } // default to 1
    num = Math.min(num,civData[job].ill);
    num = Math.max(num,-civData[job].owned);
    civData[job].ill -= num;
    population.totalSick -= num;
    civData[job].owned += num;
    population.healthy += num;

    return num;
}

//Selects random workers, transfers them to their Ill variants
function plague(sickNum){
    var actualNum = 0;
    var i;

    updatePopulation();
    // Apply in 1-worker groups to spread it out.
    for (i=0;i<sickNum;i++){ actualNum += -heal(randomHealthyWorker(),-1); }

    return actualNum;
}

// Select a sick worker type to cure, with certain priorities
function getNextPatient()
{ 
    var i;
    //xxx Need to generalize this list.
    var jobs=["healer","cleric","farmer","soldier","cavalry","labourer",
        "woodcutter","miner","tanner","blacksmith","unemployed"];
    for (i=0;i<jobs.length;++i)
    {
        if (civData[jobs[i]].ill > 0) { return jobs[i]; }
    }

    return "";
}

function doHealers() {
    var job, numHealed = 0;
    var numHealers = civData.healer.owned + (civData.cat.owned * (civData.companion.owned));

    // How much healing can we do?
    curCiv.cureCounter += (numHealers * civData.healer.efficiency * efficiency.happiness);

    // We can't cure more sick people than there are
    curCiv.cureCounter = Math.min(curCiv.cureCounter, population.totalSick);

    // Cure people until we run out of healing capacity or herbs
    while (curCiv.cureCounter >= 1 && curCiv.herbs.owned >= 1) {
        job = getNextPatient();
        if (!job) { break; }
        heal(job); 
        --curCiv.cureCounter;
        --curCiv.herbs.owned;
        ++numHealed;
    }

    return numHealed;
}

function doGraveyards()
{
    var i;
    if (curCiv.corpses.owned > 0 && curCiv.grave.owned > 0){
        //Clerics will bury corpses if there are graves to fill and corpses lying around
        for (i=0;i<civData.cleric.owned;i++){
            if (curCiv.corpses.owned > 0 && curCiv.grave.owned > 0){
                curCiv.corpses.owned -= 1;
                curCiv.grave.owned -= 1;
            }
        }
        updatePopulationUI();
    }
}

function doCorpses() {
    if (curCiv.corpses.owned <= 0) { return; }

    // Corpses lying around will occasionally make people sick.
    // 1-in-50 chance (1-in-100 with feast)
    var sickChance = 50 * Math.random() * (1 + civData.feast.owned);
    if (sickChance >= 1) { return; }

    // Infect up to 1% of the population.
    var num = Math.floor(population.current/100 * Math.random());
    if (num <= 0) {  return; }

    num = plague(num);
    if (num > 0) {
        updatePopulationUI();
        gameLog(prettify(num) + " workers got sick"); //notify player
    }
}

function doFight(attacker,defender)
{
    // Defenses vary depending on whether the player is attacking or defending.
    var fortMod = (defender.alignment == "player" ? (curCiv.fortification.owned * civData.fortification.efficiency)
                                                  : (civData.efort.owned * civData.efort.efficiency));
    var palisadeMod = ((defender.alignment == "player")&&(civData.palisade.owned)) * civData.palisade.efficiency;

    // Determine casualties on each side.  Round fractional casualties
    // probabilistically, and don't inflict more than 100% casualties.
    var attackerCas = Math.min(civData[attacker.id].owned,rndRound(getCasualtyMod(defender.id,attacker.id) * civData[defender.id].owned * civData[defender.id].efficiency));
    var defenderCas = Math.min(civData[defender.id].owned,rndRound(getCasualtyMod(attacker.id,defender.id) * civData[attacker.id].owned * (civData[attacker.id].efficiency - palisadeMod) * Math.max(1 - fortMod, 0)));

    civData[attacker.id].owned -= attackerCas;
    civData[defender.id].owned -= defenderCas;

    // Give player credit for kills.
    var playerCredit = ((attacker.alignment == "player") ? defenderCas :
                        (defender.alignment == "player") ? attackerCas : 0);

    //Increments enemies slain, corpses, and piety
    curCiv.enemySlain.owned += playerCredit;
    if (civData.throne.owned) { curCiv.throneCount += playerCredit; }
    curCiv.corpses.owned += (attackerCas + defenderCas);
    if (civData.book.owned) { curCiv.piety.owned += (attackerCas + defenderCas) * 10; }
}


function doSlaughter(attacker)
{
    var killVerb = (attacker.species == "animal") ? "eaten" : "killed";
    var target = randomHealthyWorker(); //Choose random worker
    if (target) { 
        if (Math.random() < attacker.killExhaustion) { // An attacker may disappear after killing
            --civData[attacker.id].owned; }

        --population.current;
        --civData[target].owned;

        if (attacker.species != "animal") { ++curCiv.corpses.owned; } // Animals will eat the corpse
        gameLog(getJobSingular(target) + " " + killVerb + " by " + attacker.name);
        updatePopulation();
    } else { // Attackers slowly leave once everyone is dead
        var leaving = Math.ceil(civData[attacker.id].owned * Math.random() * attacker.killFatigue);
        civData[attacker.id].owned -= leaving;
        updateJobButtons();
    }
}

function doLoot(attacker)
{
    // Select random resource, steal random amount of it.
    var target = lootable[Math.floor(Math.random() * lootable.length)];
    var stolenqty = Math.floor((Math.random() * 1000)); //Steal up to 1000.
    stolenqty = Math.min(stolenqty,target.owned);
    if (stolenqty > 0) { gameLog(stolenqty + " " + target.name + " stolen by " + attacker.name); }
    target.owned -= stolenqty;
    if (target.owned <= 0) {
        //some will leave
        var leaving = Math.ceil(civData[attacker.id].owned * Math.random() * attacker.lootFatigue);
        civData[attacker.id].owned -= leaving;
        updateJobButtons();
    }
    civData[attacker.id].owned -= 1; // Attackers leave after stealing something.
    updateResourceTotals();
}

function doSack(attacker)
{
    //Destroy buildings
    var target = sackable[Math.floor(Math.random() * sackable.length)];

    // Slightly different phrasing for fortifications
    var destroyVerb = "burned";
    if (target == civData.fortification) { destroyVerb = "damaged"; } 

    if (target.owned > 0){
        --target.owned;
        ++curCiv.freeLand.owned;
        gameLog(target.name + " " + destroyVerb + " by " + attacker.name);
    } else {
        //some will leave
        var leaving = Math.ceil(civData[attacker.id].owned * Math.random() * (1/112));
        civData[attacker.id].owned -= leaving;
        updateJobButtons();
    }

    civData[attacker.id].owned -= 1;
    if (civData[attacker.id].owned < 0) { civData[attacker.id].owned = 0; }
    updateRequirements(target);
    updateResourceTotals();
    updatePopulation(); // Limits might change
}

function doHavoc(attacker)
{
    var havoc = Math.random(); //barbarians do different things
    if      (havoc < 0.3) { doSlaughter(attacker); } 
    else if (havoc < 0.6) { doLoot(attacker); } 
    else                  { doSack(attacker); }
}

function doShades()
{
    if (civData.shade.owned <= 0) { return; }

    function shadeAttack(attacker,defender)
    {
        var num = Math.min((civData[attacker.id].owned/4),civData[defender.id].owned);
        //xxx Should we give book and throne credit here?
        civData[defender.id].owned -= Math.floor(num);
        civData[attacker.id].owned -= Math.floor(num);
    }

    shadeAttack(civData.wolf, civData.shade);
    shadeAttack(civData.bandit, civData.shade);
    shadeAttack(civData.barbarian, civData.shade);

    civData.shade.owned = Math.floor(civData.shade.owned * 0.95);
    if (civData.shade.owned < 0) { civData.shade.owned = 0; }
}

function doEsiege()
{
    if (civData.esiege.owned <= 0) { return; }

    var i, hit, firing;
    //First check there are enemies there defending them
    if (civData.bandit.owned > 0 || civData.barbarian.owned > 0){
        if (curCiv.fortification.owned > 0){ //needs to be something to fire at
            firing = Math.ceil(Math.min(civData.esiege.owned/2,100)); //At most half or 100 can fire at a time
            for (i = 0; i < firing; i++){
                if (curCiv.fortification.owned > 0){ //still needs to be something to fire at
                    hit = Math.random();
                    if (hit < civData.esiege.efficiency){
                        curCiv.fortification.owned -= 1;
                        gameLog("Enemy siege engine damaged our fortifications");
                    } else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
                        civData.esiege.owned -= 1;
                    }
                }
            }
            updateRequirements(curCiv.fortification);
            updateResourceTotals();
        }
    } else if (civData.soldier.owned > 0 || civData.cavalry.owned > 0) {
        //the siege engines are undefended
        if (civData.mathematics.owned){ //Can we use them?
            gameLog("Captured " + prettify(civData.esiege.owned) + " enemy siege engines.");
            civData.siege.owned += civData.esiege.owned; //capture them
            updatePartyButtons(); //show them in conquest pane
        } else {
            //we can't use them, therefore simply destroy them
            gameLog("Destroyed " + prettify(civData.esiege.owned) + " enemy siege engines.");
        }
        civData.esiege.owned = 0;
    }
    updateJobButtons();
}

function doSiege()
{
    var i, hit;
    var firing = Math.ceil(Math.min(civData.siege.owned/2,civData.efort.owned*2));
    if (firing > civData.siege.owned) { firing = civData.siege.owned; } //should never happen
    for (i = 0; i < firing; i++){
        if (civData.efort.owned > 0){ //still needs to be something to fire at
            hit = Math.random();
            if (hit < civData.siege.efficiency){ //each siege engine has 10% to hit
                civData.efort.owned -= 1;
            } else if (hit > 0.95){ //each siege engine has 5% to misfire and destroy itself
                civData.siege.owned -= 1;
                updateRequirements(curCiv.fortification);
            }
        }
    }
}

function doSkirmish(attacker)
{
    if (civData[attacker.id].owned <= 0) { return; }

    if (civData.soldier.owned > 0 || civData.cavalry.owned > 0){ //FIGHT!
        //handles cavalry
        if (civData.cavalry.owned > 0){
            doFight(attacker,civData.cavalry);
        }
        //handles soldiers
        if (civData.soldier.owned > 0){
            doFight(attacker,civData.soldier);
        }
        //Updates population figures (including total population)
        updatePopulation();
        updatePopulationUI();
    } else {
        attacker.onWin();
    }
}

//Handling mob attacks
function doMobs() {
    doSkirmish(civData.wolf);
    doSkirmish(civData.bandit);
    doSkirmish(civData.barbarian);
    doShades();
    doEsiege();
}

function raidWin() {
    gameLog("Raid victorious!"); //notify player
    raiding.victory = true; //set victory for future handling

    if ((targetMax != civSizes[civSizes.length-1].id) && raiding.last == targetMax)
    {
        // We fought our largest eligible foe, but not the largest possible.  Raise the limit.
        targetMax = civSizes[civSizes[targetMax] + 1].id;
    }
        // Improve mood based on size of defeated foe.
    mood((civSizes[raiding.last] + 1)/100);

    //lamentation
    if (civData.lament.owned){
        curCiv.attackCounter -= Math.ceil(raiding.epop/2000);
    }
}


function doRaid() {
    setElemDisplay(document.getElementById("raidGroup"),civData.standard.owned && !raiding.raiding);
    if (!raiding.raiding){ return; } // We're not raiding right now.

    if (((civData.soldierParty.owned + civData.cavalryParty.owned) > 0) || raiding.victory){ //technically you can win, then remove all your soldiers
        if (civData.esoldier.owned > 0){
            /* FIGHT! */
            //Handles cavalry
            if (civData.cavalryParty.owned > 0){
                doFight(civData.cavalryParty,civData.esoldier);
            }
            //Handles infantry
            if (civData.soldierParty.owned > 0){
                doFight(civData.soldierParty,civData.esoldier);
            }
            //Handles siege engines
            if (civData.siege.owned > 0 && civData.efort.owned > 0){ //need to be siege weapons and something to fire at
                doSiege();
            }
            /* END FIGHT! */
            
            //checks victory conditions (needed here because of the order of tests)
            if (civData.esoldier.owned <= 0){
                civData.esoldier.owned = 0; //ensure esoldier is 0
                civData.efort.owned = 0; //ensure efort is 0
                raidWin();
                updateTargets(); //update the new target
            }
            updatePartyButtons(); //display new totals for army soldiers and enemy soldiers
        } else if (raiding.victory){
            //handles the victory outcome
            document.getElementById("victoryGroup").style.display = "block";
        } else {
            //victory outcome has been handled, end raid
            raiding.raiding = false;
            raiding.epop = 0;
        }
    } else {
        gameLog("Raid defeated");
        civData.esoldier.owned = 0;
        civData.efort.owned = 0;
        civData.siege.owned = 0;
        raiding.raiding = false;
        raiding.epop = 0;
        raiding.plunderLoot = {};
        updatePartyButtons();
    }
}

function doLabourers() {
    var wonderResources = [curCiv.food,curCiv.wood,curCiv.stone,curCiv.skins,curCiv.herbs,curCiv.ore,
                           curCiv.leather,curCiv.metal,curCiv.piety];
    if (!wonder.building) { return; }

    if (wonder.progress >= 100){
        //Wonder is finished! First, send workers home
        civData.unemployed.owned += civData.labourer.owned;
        civData.unemployed.ill += civData.labourer.ill;
        civData.labourer.owned = 0;
        civData.labourer.ill = 0;
        updatePopulation();
        updatePopulationUI();
        //hide limited notice
        document.getElementById("lowResources").style.display = "none";
        //then set wonder.completed so things will be updated appropriately
        wonder.completed = true;
    } else {
        //we're still building
        
        // First, check our labourers and other resources to see if we're limited.
        var num = civData.labourer.owned;
        wonderResources.forEach( function(elem){ num = Math.min(num,elem.owned); });

        //remove resources
        wonderResources.forEach( function(elem){ elem.owned -= num; });

        //increase progress
        wonder.progress += num / (1000000 * Math.pow(1.5,wonder.total));
        
        //show/hide limited notice
        setElemDisplay(document.getElementById("lowResources"),(num < civData.labourer.owned));
        updateWonderLimited();
    }
    updateWonder();
}

// Start of init program code
function initCivclicker() {
    document.title = "CivClicker ("+versionData+")"; //xxx Not in XML DOM.

    addBuildingRows();
    addJobRows();
    addPartyRows();
    addUpgradeRows();
    addAchievementRows();
    addRaidRows();
    makeDeitiesTables();

    if (!load("localStorage")) { //immediately attempts to load
        //Prompt player for names
        renameCiv();
        renameRuler();
    }
    updateSettings();
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
    if (settings.autosave && (++settings.autosaveCounter >= settings.autosaveTime)){ 
        settings.autosaveCounter = 0;
        // If autosave fails, disable it.
        if (!save("auto")) { settings.autosave = false; }
    }
    
    //Resource-related
    doFarmers();
    doWoodcutters();
    doMiners();
    
    //Workers convert secondary resources into tertiary resources
    doBlacksmiths();
    doTanners();

    //Clerics generate piety
    doClerics();
    
    // Check for starvation
    doStarve();

    //xxx Need to kill workers who die from exposure.

    //Resources occasionally go above their caps.
    //Cull the excess /after/ other workers have taken their inputs.
    resourceData.forEach( function(elem){ if (elem.owned > elem.limit) { elem.owned = elem.limit; } });

    //Timers - routines that do not occur every second
    
    //Checks when mobs will attack
    //xxx Perhaps this should go after the doMobs() call, so we give 1 turn's warning?
    var mobType, choose;
    if (population.current + curCiv.zombie.owned > 0) { ++curCiv.attackCounter; } // No attacks if deserted.
    if (population.current + curCiv.zombie.owned > 0 && curCiv.attackCounter > (60 * 5)){ //Minimum 5 minutes
        if (600*Math.random() < 1) {
            curCiv.attackCounter = 0;
            //Choose which kind of mob will attack
            mobType = "wolf"; // Default to wolves
            if (population.current + curCiv.zombie.owned >= 10000) {
                choose = Math.random();
                if      (choose > 0.5) { mobType = "barbarian"; } 
                else if (choose > 0.2) { mobType = "bandit"; }
            } else if (population.current + curCiv.zombie.owned >= 1000) {
                if (Math.random() > 0.5) { mobType = "bandit"; }
            }
            spawnMob(mobType);
        }
    }
    //Decrements the pestTimer
    curCiv.pestTimer = (curCiv.pestTimer < 1) ? 0 : (curCiv.pestTimer-1);
    
    //Handles the Glory bonus
    if (curCiv.gloryTimer > 0){
        document.getElementById("gloryTimer").innerHTML = curCiv.gloryTimer;
        --curCiv.gloryTimer;
    } else {
        document.getElementById("gloryGroup").style.display = "none";
    }
    
    //Population-related
    doMobs();
    doRaid();

    doGraveyards();
    doHealers(); 
    doCorpses();

    if (curCiv.throneCount >= 100){
        //If sufficient enemies have been slain, build new temples for free
        curCiv.temple.owned += Math.floor(curCiv.throneCount/100);
        curCiv.throneCount = 0;
        updateResourceTotals();
    }
    
    if (curCiv.graceCost > 1000) {
        curCiv.graceCost = Math.floor(--curCiv.graceCost);
        document.getElementById("graceCost").innerHTML = prettify(curCiv.graceCost);
    }
    
    doWalk();
    
    doLabourers();

    //traders occasionally show up
    if (population.current + curCiv.zombie.owned > 0) { curCiv.tradeCounter += 1; }
    var delayMult = 60 * (3 - ((civData.currency.owned)+(civData.commerce.owned)));
    var check;
    if (population.current + curCiv.zombie.owned > 0 && curCiv.tradeCounter > delayMult){
        check = Math.random() * delayMult;
        if (check < (1 + (0.2 * (civData.comfort.owned)))){
            curCiv.tradeCounter = 0;
            tradeTimer();
        }
    }
    
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
    testAchievements();
    
    //Data changes should be done; now update the UI.
    updateUpgrades();
    updateBuildingButtons();
    updateJobButtons();
    updatePartyButtons();
    updatePopulationUI();
    updateTargets();
    updateDevotion();
    updateWonder();
    updateReset();
    
    //Debugging - mark end of main loop and calculate delta in milliseconds
    //var end = new Date().getTime();
    //var time = end - start;
    //console.log("Main loop execution time: " + time + "ms");
    
}, 1000); //updates once per second (1000 milliseconds)

/* UI functions */

// Called when user switches between the various panes on the left hand side of the interface
// Returns the target pane element.
function paneSelect(control){
    var i,oldTarget;

    // Identify the target pane to be activated, and the currently active
    // selector tab(s).
    var newTarget = dataset(control,"target");
    var selectors = document.getElementById("selectors");
    if (!selectors) { console.log("No selectors found"); return null; }
    var curSelects = selectors.getElementsByClassName("selected");

    // Deselect the old panels.
    for (i = 0; i < curSelects.length; ++i) { 
        oldTarget = dataset(curSelects[i],"target");
        if (oldTarget == newTarget) { continue; }
        document.getElementById(oldTarget).classList.remove("selected");
        curSelects[i].classList.remove("selected");
    }

    // Select the new panel.
    control.classList.add("selected");
    var targetElem = document.getElementById(newTarget);
    if (targetElem) { targetElem.classList.add("selected"); }
    return targetElem;
}

function impExp(){
    var elem = document.getElementById("impexp");
    if (elem.style.display == "block"){
        elem.style.display = "none";
    } else {
        elem.style.display = "block";
    }
}

function versionAlert(){
    console.log("New Version Available");
    document.getElementById("versionAlert").style.display = "inline";
}

function prettify(input){
    //xxx TODO: Add appropriate format options
    return (settings.delimiters) ? Number(input).toLocaleString() : input.toString();
}


function setAutosave(value){ 
    if (value !== undefined) { settings.autosave = value; } 
    document.getElementById("toggleAutosave").checked = settings.autosave;
}
function onToggleAutosave(control){ return setAutosave(control.checked); }

function setCustomQuantities(value){
    var i;
    var elems;
    var curPop = population.current + curCiv.zombie.owned;

    if (value !== undefined) { settings.customIncr = value; }
    document.getElementById("toggleCustomQuantities").checked = settings.customIncr;

    setElemDisplay(document.getElementById("customJobQuantity"),settings.customIncr);
    setElemDisplay(document.getElementById("customPartyQuantity"),settings.customIncr);
    setElemDisplay(document.getElementById("customBuildQuantity"),settings.customIncr);
    setElemDisplay(document.getElementById("customSpawnQuantity"),settings.customIncr);

    elems = document.getElementsByClassName("unit10");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 10)); }

    elems = document.getElementsByClassName("unit100");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 100)); }

    elems = document.getElementsByClassName("unit1000");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 1000)); }

    elems = document.getElementsByClassName("unitInfinity");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 1000)); }

    elems = document.getElementsByClassName("building10");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 100)); }

    elems = document.getElementsByClassName("building100");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 1000)); }

    elems = document.getElementsByClassName("building1000");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 10000)); }

    elems = document.getElementsByClassName("buildingInfinity");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],!settings.customIncr && (curPop >= 10000)); }

    elems = document.getElementsByClassName("buycustom");
    for (i = 0; i < elems.length; ++i) { setElemDisplay(elems[i],settings.customIncr); }
}
function onToggleCustomQuantities(control){ return setCustomQuantities(control.checked); }

// Toggles the display of the .notes class
function setNotes(value){
    if (value !== undefined) { settings.notes = value; }
    document.getElementById("toggleNotes").checked = settings.notes;

    var i;
    var elems = document.getElementsByClassName("note");
    for(i = 0; i < elems.length; ++i) {
        setElemDisplay(elems[i],settings.notes);
    }
}
function onToggleNotes(control){ return setNotes(control.checked); }

// value is the desired change in 0.1em units.
function textSize(value){
    if (value !== undefined) { settings.fontSize += 0.1 * value; }
    document.getElementById("smallerText").disabled = (settings.fontSize <= 0.5); 

    //xxx Should this be applied to the document instead of the body?
    body.style.fontSize = settings.fontSize + "em";
}

function setShadow(value){
    if (value !== undefined) { settings.textShadow = value; }
    document.getElementById("toggleShadow").checked = settings.textShadow;
    var shadowStyle = "3px 0 0 #fff, -3px 0 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff"
                    + ", 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff";
    body.style.textShadow = settings.textShadow ? shadowStyle : "none";
}
function onToggleShadow(control){ return setShadow(control.checked); }

// Does nothing yet, will probably toggle display for "icon" and "word" classes 
// as that's probably the simplest way to do this.
function setIcons(value){ 
    if (value !== undefined) { settings.useIcons = value; } 
    document.getElementById("toggleIcons").checked = settings.useIcons;

    var i;
    var elems = document.getElementsByClassName("icon");
    for(i = 0; i < elems.length; ++i) {
        // Worksafe implies no icons.
        elems[i].style.visibility = (settings.useIcons && !settings.worksafe) ? "visible" : "hidden";
    }
}
function onToggleIcons(control){ return setIcons(control.checked); }

function setDelimiters(value){
    if (value !== undefined) { settings.delimiters = value; }
    document.getElementById("toggleDelimiters").checked = settings.delimiters;
    updateResourceTotals();
}
function onToggleDelimiters(control){ return setDelimiters(control.checked); }

function setWorksafe(value){
    if (value !== undefined) { settings.worksafe = value; }
    document.getElementById("toggleWorksafe").checked = settings.worksafe;

    //xxx Should this be applied to the document instead of the body?
    if (settings.worksafe){
        body.classList.remove("hasBackground");
    } else {
        body.classList.add("hasBackground");
    }

    setIcons(); // Worksafe overrides icon settings.
}
function onToggleWorksafe(control){ return setWorksafe(control.checked); }


/* Debug functions */

function gameLog(message){
    //Not strictly a debug function so much as it is letting the user know when something happens without needing to watch the console.
    var time = "0.00";
    //get the current date, extract the current time in HH.MM format
    //xxx It would be nice to use Date.getLocaleTimeString(locale,options) here, but most browsers don't allow the options yet.
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
    curCiv.food.owned += 1000000;
    curCiv.wood.owned += 1000000;
    curCiv.stone.owned += 1000000;
    curCiv.barn.owned += 5000;
    curCiv.woodstock.owned += 5000;
    curCiv.stonestock.owned += 5000;
    curCiv.herbs.owned += 1000000;
    curCiv.skins.owned += 1000000;
    curCiv.ore.owned += 1000000;
    curCiv.leather.owned += 1000000;
    curCiv.metal.owned += 1000000;
    curCiv.piety.owned += 1000000;
    curCiv.gold.owned += 10000;
    renameRuler("Cheater");
    updatePopulation();
    updatePopulationUI();
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
