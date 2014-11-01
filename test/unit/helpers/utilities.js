"use strict";

module.exports = {
	setValue : function (object, property, value) {
		var oldValue = object[property];
		object[property] = value;

		return {
			restore : function () {
				object[property] = oldValue;
			}
		};
	}
};