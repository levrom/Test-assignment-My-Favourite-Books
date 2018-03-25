var ISBN = (function(){
	"use strict";

	var validateISBN13 = function(isbnChars){
		var checksum = 0;

		isbnChars.forEach(function(isbnChar, key){
			checksum += parseInt(isbnChar, 10) * (key % 2 === 1 ? 3 : 1);
		});

		return checksum % 10 === 0;
	},
	validateISBN10 = function(isbnChars){
		var checksum = 0, checkdigit = isbnChars.pop();

		isbnChars.forEach(function(isbnChar, key){
			checksum += parseInt(isbnChar, 10) * (10 - key);
		});

		return (checksum + parseInt(checkdigit === "X" ? 10 : checkdigit, 10)) % 11 === 0;
	},
	validateISBN = function(isbnRaw){
		var isbnChars = isbnRaw.trim().replace(/-/g, "").split(""),
		isbnValidator = function(){ return false; };

		switch(isbnChars.length){
			case 10:
				isbnValidator = validateISBN10;
				break;
			case 13:
				isbnValidator = validateISBN13;
				break;
		}

		return isbnValidator(isbnChars);
	},
	innovateISBN = function(isbn10){
		var isbn13 = "978";

		if(!validateISBN(isbn10)){
			return undefined;
		}
		isbn10 = isbn10.trim().replace(/-/g, "");

		isbn13 = (isbn13 + isbn10).substr(0, 12);

		(function(){
			var checksum = 0;

			isbn13.split("").forEach(function(isbnChar, key){
				checksum += parseInt(isbnChar, 10) * (key % 2 === 1 ? 3 : 1);
			});

			isbn13 += (10 - checksum % 10).toString();
		})();

		return isbn13;
	};

	if(typeof exports !== "undefined"){
		exports.validateISBN = validateISBN;
		exports.innovateISBN = innovateISBN;
	}

	return {
		validate : validateISBN,
		innovate : innovateISBN
	};
})();
