(function(window) {
    var Obj = function(ops) {
        this.$el = ops.$el ? ops.$el : undefined;
        this.el = ops.el ? ops.el : undefined;
        this.w = this.checkProperty(ops.w, 20);
        this.h = this.checkProperty(ops.h, 20);
        this.mass = this.checkProperty(ops.mass, 1);
        this.radius = this.checkProperty(ops.radius, 0);
        this.diameter = this.checkProperty(ops.radius * 2, 0);
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.hx = 0;
        this.hy = 0;
        this.ex = 0;
        this.ey = 0;
        this.prefix = this.getPrefix();
        this.prefixJs = this.prefix.js;
    };
    Obj.prototype = {
        get home() {
            return new Vector(this.hx, this.hy);
        },
        set home(home) {
            this.hx = home.x;
            this.hy = home.y;
        },
        get pos() {
            return new Vector(this.x, this.y);
        },
        set pos(pos) {
            this.x = pos.x;
            this.y = pos.y;
        },
        get velo() {
            return new Vector(this.vx, this.vy);
        },
        set velo(velo) {
            this.vx = velo.x;
            this.vy = velo.y;
        },
        get end() {
            return new Vector(this.ex, this.ey);
        },
        set end(end) {
            this.ex = end.x;
            this.ey = end.y;
        },
        checkProperty: function(param, val) {
            var newParam = param;
            if (typeof newParam === "undefined") {
                newParam = val;
            }
            return newParam;
        },
        getPrefix: function() {
            var styles = window.getComputedStyle(document.documentElement, "");
            var pre = (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || styles.OLink === "" && [ "", "o" ])[1];
            var dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1];
            return {
                dom: dom,
                lowercase: pre,
                css: "-" + pre + "-",
                js: pre[0].toUpperCase() + pre.substr(1)
            };
        },
        changeStyles: function() {
            this.$el.css(this.prefixJs + "Transform", "translate3d(" + this.x + "px, " + this.y + "px, 0)");
        }
    };
    window.Obj = Obj;
})(window);
(function(window) {
    var Vector = function(x, y) {
        this.x = x;
        this.y = y;
    };
    Vector.prototype = {
        lengthSquared: function() {
            return this.x * this.x + this.y * this.y;
        },
        length: function() {
            return Math.sqrt(this.lengthSquared());
        },
        greater: function(vec) {
            if (this.x >= vec.x && this.y >= vec.y) {
                return true;
            }
            return false;
        },
        addScaled: function(vec, k) {
            return new Vector(this.x + k * vec.x, this.y + k * vec.y);
        },
        subtract: function(vec) {
            return new Vector(this.x - vec.x, this.y - vec.y);
        },
        setBoundaries: function(bonX, bonY, radius) {
            if (this.x < bonX.minX) {
                this.x = bonX.minX;
            }
            if (this.x > bonX.maxX - radius) {
                this.x = bonX.maxX - radius;
            }
            if (this.y < bonY.minY) {
                this.y = bonY.minY;
            }
            if (this.y > bonY.maxY - radius) {
                this.y = bonY.maxY - radius;
            }
            return new Vector(this.x, this.y);
        },
        multiply: function(k) {
            return new Vector(k * this.x, k * this.y);
        },
        divide: function(k) {
            return new Vector(this.x / k, this.y / k);
        },
        isChangeDirection: function(vec, direction, axis) {
            var newDirection;
            if (this[axis] < vec[axis] && direction !== "firstSide" || this[axis] > vec[axis] && direction !== "secondSide") {
                return true;
            } else if (this[axis] >= vec[axis]) {
                return false;
            }
        },
        add: function(vec) {
            return new Vector(this.x + vec.x, this.y + vec.y);
        },
        addScalar: function(k) {
            this.x += k;
            this.y += k;
        },
        negate: function() {
            this.x = -this.x;
            this.y = -this.y;
        },
        incrementBy: function(vec) {
            this.x += vec.x;
            this.y += vec.y;
        },
        perp: function(u, anticlockwise) {
            if (typeof anticlockwise === "undefined") {
                anticlockwise = true;
            }
            var length = this.length();
            var vec = new Vector(this.y, (-this.x));
            if (length > 0) {
                if (anticlockwise) {
                    vec.scaleBy(u / length);
                } else {
                    vec.scaleBy(-u / length);
                }
            } else {
                vec = new Vector(0, 0);
            }
            return vec;
        },
        projection: function(vec) {
            var length = this.length();
            var lengthVec = vec.length();
            var proj;
            if (length == 0 || lengthVec == 0) {
                proj = 0;
            } else {
                proj = (this.x * vec.x + this.y * vec.y) / lengthVec;
            }
            return proj;
        },
        unit: function() {
            var length = this.length();
            if (length > 0) {
                return new Vector(this.x / length, this.y / length);
            } else {
                return new Vector(0, 0);
            }
        },
        dotProduct: function(vec) {
            return this.x * vec.x + this.y * vec.y;
        },
        scaleBy: function(k) {
            this.x *= k;
            this.y *= k;
        },
        transfer: function(k) {
            var vec = new Vector(this.x, this.y);
            var unitVec = vec.unit();
            unitVec.scaleBy(k);
            return unitVec;
        },
        para: function(u, positive) {
            if (typeof positive === "undefined") {
                positive = true;
            }
            var length = this.length();
            var vec = new Vector(this.x, this.y);
            if (positive) {
                vec.scaleBy(u / length);
            } else {
                vec.scaleBy(-u / length);
            }
            return vec;
        },
        project: function(vec) {
            return vec.para(this.projection(vec));
        }
    };
    Vector.add = function(arr) {
        var vectorSum = new Vector(0, 0);
        for (var i = 0; i < arr.length; i++) {
            var vector = arr[i];
            vectorSum.incrementBy(vector);
        }
        return vectorSum;
    };
    Vector.angleBetween = function(vec1, vec2) {
        return Math.acos(vec1.dotProduct(vec2) / (vec1.length() * vec2.length()));
    };
    window.Vector = Vector;
})(window);