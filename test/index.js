GLOBAL.window = {
    location:{
        host: 'mysite.com'
    }
};

var grape = require('grape'),
    Router = require('../'),
    router = new Router({
        home:{
            _url: ['/', '/index.html'],
            majiggers:{
                _url: '/majiggers'
            },
            things:{
                _url: '/things',
                newThing:{
                    _url: '/things/new'
                },
                thing:{
                    _url: '/things/{0}',
                    aStuff:{
                        _url: ['/things/{0}/stuff/{1}', '/things/{0}/stuff/{1}/{2}']
                    }
                }
            }
        },
        login: {
            _url: '/login'
        }
    });



router.basePath = '';

grape('match a route', function(t){
    t.plan(6);

    t.equal(router.find('/things/5'), 'thing');
    t.equal(router.find('/things'), 'things');
    t.equal(router.find('/things/5/stuff/1'), 'aStuff');
    t.equal(router.find('/'), 'home');
    t.equal(router.find('/things/new'), 'newThing');
    t.equal(router.find('/stuff'), undefined);
});

grape('up a level', function(t){
    t.plan(3);

    t.equal(router.upOne('/things/5/stuff/majigger'), '/things/5');
    t.equal(router.upOne('/things/5'), '/things');
    t.equal(router.upOne('/'), '/');
});

grape('up by name', function(t){
    t.plan(1);

    t.equal(router.upOneName('aStuff'), 'thing');
});

grape('get', function(t){
    t.plan(5);

    t.equal(router.get('home'), '/');
    t.equal(router.get('thing', 1), '/things/1');
    t.equal(router.get('thing'), '/things/');
    t.equal(router.get('aStuff', 1, 2), '/things/1/stuff/2');
    t.equal(router.get('aStuff', 1, 2, 3), '/things/1/stuff/2/3');
});

grape('getTemplate', function(t){
    t.plan(5);

    t.equal(router.getTemplate('home'), '/');
    t.equal(router.getTemplate('thing', 1), '/things/{0}');
    t.equal(router.getTemplate('thing'), '/things/{0}');
    t.equal(router.getTemplate('aStuff', 1, 2), '/things/{0}/stuff/{1}');
    t.equal(router.getTemplate('aStuff', 1, 2, 3), '/things/{0}/stuff/{1}/{2}');
});

grape('isIn', function(t){
    t.plan(3);

    t.ok(router.isIn('things', 'home'));
    t.ok(router.isIn('thing', 'things'));
    t.notOk(router.isIn('majiggers', 'stuff'));
});

grape('isRoot', function(t){
    t.plan(3);

    t.ok(router.isRoot('home'));
    t.ok(router.isRoot('login'));
    t.notOk(router.isRoot('majiggers'));
});

grape('values', function(t){
    t.plan(2);

    t.deepEqual(router.values('/things/1/stuff/2'), ['1','2']);
    t.deepEqual(router.values('/things/1/stuff/2/3'), ['1','2','3']);
});

grape('drill', function(t){
    t.plan(2);

    t.deepEqual(router.drill('/things/1', 'aStuff', 2), '/things/1/stuff/2');
    t.deepEqual(router.drill('/things/1', 'aStuff'), '/things/1/stuff/');
});

grape('resolve', function(t){
    t.plan(2);

    t.deepEqual(router.resolve('http://a.b.c', '/a', 2), 'http://a.b.c/a');
    t.deepEqual(router.resolve('http://a.b.c', 'http://d.e.f'), 'http://d.e.f');
});