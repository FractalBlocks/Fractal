"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("../../interfaces/view");
exports.name = 'Counter';
exports.state = 0;
exports.inputs = function () { return ({
    inc: exports.actions.Inc,
    dec: exports.actions.Dec,
}); };
exports.actions = {
    Inc: function () { return function (s) { return s + 1; }; },
    Dec: function () { return function (s) { return s - 1; }; },
};
var view = function (_a) {
    var ev = _a.ev;
    return function (s) { return view_1.h('div', [
        view_1.h('button', {
            on: { click: ev('inc') },
        }, '+'),
        view_1.h('div', s + ''),
        view_1.h('button', {
            on: { click: ev('dec') },
        }, '-'),
    ]); };
};
exports.interfaces = { view: view };
//# sourceMappingURL=Root.js.map