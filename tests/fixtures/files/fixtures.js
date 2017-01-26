"use strict";
const types_1 = require("./types");
class Person {
    constructor(name) {
        this._name = name;
    }
    name() {
        return this._name;
    }
}
document.body.innerHTML = new types_1.default().greet(new Person("Godfrey"));
//# sourceMappingURL=fixtures.js.map