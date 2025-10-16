"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM = exports.A = exports.LI = exports.UL = exports.P = exports.INPUT = exports.BUTTON = exports.DIV = exports.FEform = exports.FEa = exports.FEli = exports.FEul = exports.FEp = exports.FEinput = exports.FEbutton = exports.FEdiv = exports.FElement = void 0;
exports.ElementByID = ElementByID;
exports.SetDocumentContent = SetDocumentContent;
var FElement = /** @class */ (function () {
    function FElement(type) {
        var children = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            children[_i - 1] = arguments[_i];
        }
        if (typeof type === 'string' || type instanceof String) {
            this.element = document.createElement(type);
        }
        else {
            this.element = type;
        }
        for (var i in children) {
            this.element.appendChild(children[i].element);
        }
    }
    FElement.prototype.withAttributes = function (attributes) {
        for (var attribute in attributes) {
            this.element.setAttribute(attribute, attributes[attribute]);
        }
        return this;
    };
    FElement.prototype.id = function (id) {
        this.element.id = id;
        return this;
    };
    FElement.prototype.withClass = function (classname) {
        this.element.classList.add(classname);
        return this;
    };
    FElement.prototype.removeClass = function (classname) {
        this.element.classList.remove(classname);
        return this;
    };
    FElement.prototype.toggleClass = function (classname) {
        this.element.classList.toggle(classname);
        return this;
    };
    FElement.prototype.says = function (innerHTML) {
        this.element.textContent = innerHTML;
        return this;
    };
    FElement.prototype.replaceContent = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        this.element.replaceChildren();
        for (var i in children) {
            this.element.appendChild(children[i].element);
        }
        return this;
    };
    FElement.prototype.onEvent = function (eventName, callback) {
        this.element.addEventListener(eventName, callback);
        return this;
    };
    FElement.prototype.addChildren = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        for (var i in children) {
            this.element.appendChild(children[i].element);
        }
        return this;
    };
    FElement.prototype.selfDestruct = function () {
        this.element.remove();
    };
    return FElement;
}());
exports.FElement = FElement;
function ElementByID(id) {
    var e = document.getElementById(id);
    if (e) {
        return new FElement(e);
    }
    else {
        throw new Error("Could not find an element with id \"" + id + "\".");
    }
}
function SetDocumentContent() {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    document.body.replaceChildren();
    for (var i in children) {
        document.body.appendChild(children[i].element);
    }
}
var FEdiv = /** @class */ (function (_super) {
    __extends(FEdiv, _super);
    function FEdiv() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["div"], children, false)) || this;
    }
    return FEdiv;
}(FElement));
exports.FEdiv = FEdiv;
var DIV = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEdiv.bind.apply(FEdiv, __spreadArray([void 0], children, false)))();
};
exports.DIV = DIV;
var FEbutton = /** @class */ (function (_super) {
    __extends(FEbutton, _super);
    function FEbutton() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["button"], children, false)) || this;
    }
    FEbutton.prototype.does = function (action) {
        this.onEvent("click", action);
        return this;
    };
    return FEbutton;
}(FElement));
exports.FEbutton = FEbutton;
var BUTTON = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEbutton.bind.apply(FEbutton, __spreadArray([void 0], children, false)))();
};
exports.BUTTON = BUTTON;
var FEinput = /** @class */ (function (_super) {
    __extends(FEinput, _super);
    function FEinput() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["input"], children, false)) || this;
    }
    return FEinput;
}(FElement));
exports.FEinput = FEinput;
var INPUT = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEinput.bind.apply(FEinput, __spreadArray([void 0], children, false)))();
};
exports.INPUT = INPUT;
var FEp = /** @class */ (function (_super) {
    __extends(FEp, _super);
    function FEp() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["p"], children, false)) || this;
    }
    return FEp;
}(FElement));
exports.FEp = FEp;
var P = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEp.bind.apply(FEp, __spreadArray([void 0], children, false)))();
};
exports.P = P;
var FEul = /** @class */ (function (_super) {
    __extends(FEul, _super);
    function FEul() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["ul"], children, false)) || this;
    }
    return FEul;
}(FElement));
exports.FEul = FEul;
var UL = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEul.bind.apply(FEul, __spreadArray([void 0], children, false)))();
};
exports.UL = UL;
var FEli = /** @class */ (function (_super) {
    __extends(FEli, _super);
    function FEli() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["li"], children, false)) || this;
    }
    return FEli;
}(FElement));
exports.FEli = FEli;
var LI = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEli.bind.apply(FEli, __spreadArray([void 0], children, false)))();
};
exports.LI = LI;
var FEa = /** @class */ (function (_super) {
    __extends(FEa, _super);
    function FEa() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["a"], children, false)) || this;
    }
    return FEa;
}(FElement));
exports.FEa = FEa;
var A = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEa.bind.apply(FEa, __spreadArray([void 0], children, false)))();
};
exports.A = A;
var FEform = /** @class */ (function (_super) {
    __extends(FEform, _super);
    function FEform() {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArray(["form"], children, false)) || this;
    }
    return FEform;
}(FElement));
exports.FEform = FEform;
var FORM = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return new (FEa.bind.apply(FEa, __spreadArray([void 0], children, false)))();
};
exports.FORM = FORM;
