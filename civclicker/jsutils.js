"use strict";
/**
 * Copyright (C) 2014 Scott A. Colcord <sacolcor@git.code.sf.net>

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
 * along with this program in the file 'LICENSE'.
 */

function isValid(variable) {
    return ((variable !== null) &&
            (variable !== undefined) &&
            (variable !== NaN));
}


function bake_cookie(name, value) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + 30);
    var cookie = [name, '=', JSON.stringify(value),'; expires=.', exdate.toUTCString(), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
    document.cookie = cookie;
}
function read_cookie(name) {
    var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    if (result) { result = JSON.parse(result[1]); }

    return result;
}


/**
 * Convert a number to a string with digits separated using an ISO delimiter.
 * @param {number} input - The number to process.
 * @returns {string} The number, with digit groups separated.
 */
function num2fmtString(input){
    var output = '';
    var i;
    output = input.toString();
    var characteristic = '', //the bit that comes before the decimal point
        mantissa = '', //the bit that comes afterwards
        digitCount = 0,
        delimiter = "&#8239;"; //thin space is the ISO standard thousands delimiter. we need a non-breaking version

    //first split the string on the decimal point, and assign to the characteristic and mantissa
    var parts = output.split('.');
    if (typeof parts[1] === 'string') { mantissa = '.' + parts[1]; } //check it's defined first, and tack a decimal point to the start of it

    //then insert the commas in the characteristic
    var charArray = parts[0].split(""); //breaks it into an array
    for (i=charArray.length; i>0; i--){ //counting backwards through the array
        characteristic = charArray[i-1] + characteristic; //add the array item at the front of the string
        digitCount++;
        if (digitCount == 3 && i!=1){ //once every three digits (but not at the head of the number)
            characteristic = delimiter + characteristic; //add the delimiter at the front of the string
            digitCount = 0;
        }
    }
    output = characteristic + mantissa; //reassemble the number
 
    return output;
}

// Calculates the summation of elements (n...m] of the arithmetic sequence
// with increment 'incr'.
function calcArithSum(incr,n,m)
{
    // Default to just element n+1, if m isn't given.
    if (m === undefined) { m = n + 1; }
    return (m-n)*((n*incr)+((m-1)*incr))/2;
}


// Search for the largest integer X that generates func(X) < limitY.
// func should be a continuous increasing numeric function.
//xxx This would probably be more elegant written recursively.
function logSearchFn(func, limitY)
{
    var minX = 0;
    var maxX = 0;
    var curX = 0;
    var curY;

    // First, find an upper bound.
    while ((curY = func(maxX)) <= limitY)
    {
        minX = maxX;  // Previous was too low
        maxX = maxX ? maxX * 2 : (maxX + 1);
    }
    // Invariant:  minX <= desired X < maxX

    // Now binary search the range.
    while (maxX - minX > 1)
    {
        curX = Math.floor((maxX + minX)/2); // Find midpoint
        curY = func(curX);

        if (curY <= limitY)
        {
            minX = curX; // Under limit; becomes new lower bound.
        }
        else
        {
            maxX = curX; // Over limit; becomes new upper bound.
        }
    }

    return minX;
}

