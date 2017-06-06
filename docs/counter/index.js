"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../../core");
var view_1 = require("../../interfaces/view");
var style_1 = require("../../groups/style");
var root = require("./Root");
var app = core_1.run(__assign({ root: root, groups: {
        style: style_1.styleHandler('', true),
    }, interfaces: {
        view: view_1.viewHandler('#app'),
    } }, core_1.logFns));
// Hot reload - DEV ONLY
if (module.hot) {
    module.hot.accept('./Root', function () {
        var m = require('./Root');
        app.moduleAPI.reattach(m, core_1.mergeStates);
    });
}
//# sourceMappingURL=index.js.map