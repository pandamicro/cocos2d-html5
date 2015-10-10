largeModule('Class New');

test('test', function () {

    ok(cc.FireClass(), 'can define empty class');

    var Animal = cc.FireClass({
        name: 'Animal',
        properties: {
            myName: {
                default: '...',
                tooltip: 'Float',
                displayName: 'displayName'
            },
            eat: function () {
                return function () {
                    return 'eating';
                }
            },
            weight: {
                default: -1,
                serializable: false
            },
            weight10: {
                type: Fire.Integer,
                set: function (value) {
                    this.weight = Math.floor(value / 10);
                },
                get: function () {
                    return this.weight * 10;
                }
            },
            weight5x: {
                type: Fire.Integer,
                get: function () {
                    return this.weight * 5;
                },
                set: function (value) {
                    this.weight = value / 5;
                },
            },
            nonEmptyObj: {
                default: function () { return [1, 2]; }
            }
        }
    });

    strictEqual(cc.js.getClassName(Animal), 'Animal', 'get class name');

    // property

    var instance = new Animal();
    strictEqual(instance.myName, '...', 'get property');
    strictEqual(instance.eat(), 'eating', 'get chained property');
    strictEqual(instance.weight, -1, 'get partial property');
    deepEqual(instance.nonEmptyObj, [1, 2], 'get non-empty default value from function');
    notEqual(instance.nonEmptyObj, (new Animal()).nonEmptyObj, 'compute non-empty default value for every object instance');

    strictEqual(cc.FireClass.attr(Animal, 'myName').tooltip, 'Float', 'get name tooltip');
    strictEqual(cc.FireClass.attr(Animal, 'myName').displayName, 'displayName', 'get name displayName');
    strictEqual(cc.FireClass.attr(Animal, 'weight').serializable, false, 'get attribute');

    // getter / setter

    strictEqual(instance.weight10, instance.weight * 10, 'define getter');
    instance.weight10 = 40;
    strictEqual(instance.weight10, 40, 'define setter');

    strictEqual(instance.weight5x, instance.weight * 5, 'define getter by getset');
    instance.weight5x = 30;
    strictEqual(instance.weight5x, 30, 'define setter by getset');

    // constructor

    cc.js.unregisterClass(Animal);

    var constructor = new Callback();
    Animal = cc.FireClass({
        name: 'Animal',
        constructor: constructor,
        properties: {
            weight: 100
        }
    });

    constructor.enable();
    var instance1 = new Animal();
    constructor.once('call constructor');

    strictEqual(cc.FireClass.attr(Animal, 'weight').default, 100, 'can get attribute even has constructor');
    strictEqual(instance1.weight, 100, 'property inited even has constructor');

    var instance2 = new Animal();
    instance1.weight = 0;
    strictEqual(instance2.weight, 100, 'is instance property');

    var instance3 = new Animal();
    strictEqual(instance3.weight, 100, 'class define not changed');

    cc.js.unregisterClass(Animal);
});

test('Inherit', function () {
    var Animal = cc.FireClass({
        name: 'Fire.Animal',
        properties: {
            myName: 'ann'
        }
    });
    var Dog = cc.FireClass({
        name: 'Fire.Dog',
        extends: Animal,
        properties: {
            myName: {
                default: 'doge',
                tooltip: 'String'
            }
        }
    });
    var Husky = cc.FireClass({
        name: 'Fire.Husky',
        extends: Dog,
        properties: {
            weight: 100
        }
    });

    strictEqual(cc.js.getClassName(Animal), 'Fire.Animal', 'can get class name 1');
    strictEqual(cc.js.getClassName(Dog), 'Fire.Dog', 'can get class name 2');
    strictEqual(cc.js.getClassName(Husky), 'Fire.Husky', 'can get class name 3');

    strictEqual(Dog.$super, Animal, 'can get super');

    strictEqual(cc.FireClass.attr(Animal, 'myName'), cc.FireClass.attr(Dog, 'myName'),
                "inheritance chain shares the same property's attribute");
    strictEqual(cc.FireClass.attr(Dog, 'myName').tooltip, 'String', 'can modify attribute');
    strictEqual(cc.FireClass.attr(Dog, 'weight'), undefined, 'base property not added');

    var husky = new Husky();
    var dog = new Dog();

    strictEqual(dog.myName, 'doge', 'can override property');
    strictEqual(husky.myName, 'doge', 'can inherit property');

    deepEqual(Husky.__props__, /*CCObject.__props__.concat*/(['myName', 'weight']), 'can inherit prop list');
    deepEqual(Dog.__props__, /*CCObject.__props__.concat*/(['myName']), 'base prop list not changed');

    cc.js.unregisterClass(Animal, Dog, Husky);
});

test('Inherit + constructor', function () {
    var animalConstructor = Callback();
    var huskyConstructor = Callback();
    var Animal = cc.FireClass({
        name: 'Fire.Animal',
        constructor: animalConstructor,
        properties: {
            myName: 'ann'
        }
    });
    var Dog = cc.FireClass({
        name: 'Fire.Dog',
        extends: Animal,
        properties: {
            myName: 'doge'
        }
    });
    var Husky = cc.FireClass({
        name: 'Fire.Husky',
        extends: Dog,
        constructor: huskyConstructor
    });

    strictEqual(cc.js.getClassName(Dog), 'Fire.Dog', 'can get class name 2');

    animalConstructor.enable();
    huskyConstructor.enable();
    huskyConstructor.callbackFunction(function () {
        animalConstructor.once('base construct should called automatically');
        Husky.$super.call(this);
    });
    var husky = new Husky();
    huskyConstructor.once('call husky constructor');
    animalConstructor.once('call anim constructor by husky');

    var dog = new Dog();
    animalConstructor.once('call anim constructor by dog');

    strictEqual(dog.myName, 'doge', 'can override property');
    strictEqual(husky.myName, 'doge', 'can inherit property');

    cc.js.unregisterClass(Animal, Dog, Husky);
});

test('prop initial times', function () {
    var Base = cc.FireClass({
        properties: {
            foo: 0,
        }
    });
    var fooTester = Callback().enable();
    var instanceMocker = {
        constructor: Base,  // mock constructor of class instance
    };
    Object.defineProperty(instanceMocker, 'foo', {
        set: fooTester
    });
    Base.call(instanceMocker);
    fooTester.once('property should init once');

    var Sub = cc.FireClass({
        extends: Base,
        properties: {
            bar: 0,
        }
    });
    var barTester = Callback().enable();
    instanceMocker.constructor = Sub;
    Object.defineProperty(instanceMocker, 'bar', {
        set: barTester
    });
    Sub.call(instanceMocker);
    fooTester.once('foo prop should init once even if inherited');
    barTester.once('bar prop should init once');
});

test('prop reference', function () {
    var type = cc.FireClass({
        name: 'Fire.MyType',
        properties: {
            ary: [],
            vec2: {
                default: new cc.Vec2(10, 20)
            },
            dict: {
                default: {}
            }
        }
    });
    var obj1 = new type();
    var obj2 = new type();

    notStrictEqual(obj1.vec2, obj2.vec2, 'cloneable object reference not equal');
    notStrictEqual(obj1.ary, obj2.ary, 'empty array reference not equal');
    notStrictEqual(obj1.dict, obj2.dict, 'empty dict reference not equal');

    cc.js.unregisterClass(type);
});

test('serialization if inherited from CCObject', function () {
    var type = cc.FireClass({
        name: 'Fire.MyType',
        extends: CCObject
    });

    var obj = new type();
    obj.name = '阿加西';

    var json = JSON.parse(Editor.serialize(obj));
    var expected = { "__type__": "Fire.MyType", "_name": "阿加西", "_objFlags": 0 };

    deepEqual(json, expected, 'can serialize CCObject.name');

    cc.js.unregisterClass(type);
});

test('isChildClassOf', function () {
    strictEqual(cc.isChildClassOf(null, null) ||
                cc.isChildClassOf(Object, null) ||
                cc.isChildClassOf(null, Object),  false, 'nil');

    //strictEqual(cc.isChildClassOf(123, Object), false, 'can ignore wrong type');
    //strictEqual(cc.isChildClassOf(Object, 123), false, 'can ignore wrong type 2');

    strictEqual(cc.isChildClassOf(Object, Object), true, 'any obj is child of itself');

    var Base = function () {};

    strictEqual(cc.isChildClassOf(Base, Object) &&
                ! cc.isChildClassOf(Object, Base), true, 'any type is child of Object');

    Base = function () {};
    var Sub = function () {};
    cc.js.extend(Sub, Base);
    strictEqual(cc.isChildClassOf(Sub, Base) &&
                !cc.isChildClassOf(Base, Sub), true, 'Sub is child of Base');

    // fire class

    var Animal = cc.FireClass({
        name: 'Fire.Animal',
        extends: Sub,
        properties: {
            name: 'ann'
        }
    });
    var Dog = cc.FireClass({
        name: 'Fire.Dog',
        extends: Animal,
        properties: {
            name: 'doge'
        }
    });
    var Husky = cc.FireClass({
        name: 'Fire.Husky',
        extends: Dog,
        properties: {
            weight: 100
        }
    });

    strictEqual(cc.isChildClassOf( Husky, Husky), true, 'Husky is child of itself');
    strictEqual(cc.isChildClassOf( Dog, Animal), true, 'Animal is parent of Dog');
    strictEqual(cc.isChildClassOf( Husky, Animal) &&
                ! cc.isChildClassOf( Animal, Husky), true, 'Animal is parent of Husky');
    strictEqual(cc.isChildClassOf( Dog, Husky), false, 'Dog is not child of Husky');

    strictEqual(cc.isChildClassOf( Animal, Sub), true, 'Animal is child of Sub');
    strictEqual(cc.isChildClassOf( Animal, Base), true, 'Animal is child of Base');
    strictEqual(cc.isChildClassOf( Dog, Base),  true, 'Dog is child of Base');

    cc.js.unregisterClass(Animal, Dog, Husky);
});

test('statics', function () {
    var Animal = cc.FireClass({
        statics: {
            id: "be-bu"
        }
    });
    var Dog = cc.FireClass({
        extends: Animal
    });

    strictEqual(Animal.id, "be-bu", 'can get static prop');
    strictEqual(Dog.id, "be-bu", 'can copy static prop to child class');
    Animal.id = "duang-duang";
    strictEqual(Animal.id, "duang-duang", 'can set static prop');
});

test('try catch', function () {
    var originThrow = cc._throw;

    cc._throw = Callback().enable();
    var Animal = cc.FireClass({
        constructor: function () {
            null.foo();
        }
    });
    var animal = new Animal();
    ok(animal, 'should create new instance even if an exception occurs');
    cc._throw.once('should throw exception');

    cc._throw = originThrow;
});

test('property notify', function () {
    var string1 = "";
    var string2 = "";

    var Animal = cc.FireClass({
        properties: {
            legs: {
                default: 0,
                notify: function (oldValue) {
                    string1 = oldValue + " : " + this.legs;
                }
            },

            eyes: {
                default: 0,
                notify: function (oldValue) {
                    string2 = oldValue + " : " + this.eyes;
                }
            }
        }
    });

    var dogs = new Animal();
    dogs.legs = 4;
    dogs.eyes = 2;

    strictEqual(string1, "0 : 4", 'dogs has 4 legs');
    strictEqual(string2, "0 : 2", 'dogs has 2 eyes');
});
