var arrayProto = [],
    absolutePath = /^.+?\:\/\//g,
    formatRegex = /\{[0-9]*?\}/g,
    sanitiseRegex = /[#-.\[\]-^?]/g;

function sanitise(string){
    return string.replace(sanitiseRegex, '\\$&');
}

function formatString(string, values) {
    return string.replace(/{(\d+)}/g, function (match, number) {
        return (values[number] === undefined || values[number] === null) ? '' : values[number];
    });
}

function resolve(rootPath, path){
    if(path.match(absolutePath)){
        return path;
    }
    return rootPath + path;
}

function Router(routes){
    this.basePath  = window.location.protocol + '//' + window.location.host;
    this.routes = routes;
    this.homeRoute = 'home';
}

function scanRoutes(routes, fn){
    var route,
        routeKey,
        result;

    for(var key in routes){
        if(key === '_url'){
            continue;
        }

        // Scan children first
        result = scanRoutes(routes[key], fn);
        if(result != null){
            return result;
        }
        // Scan current route
        result = fn(routes[key], key);
        if(result != null){
            return result;
        }
    }
}

Router.prototype.details = function(url){
    var router = this;

    if(url == null){
        url = window.location.href;
    }

    return scanRoutes(this.routes, function(route, routeName){
        var urls = Array.isArray(route._url) ? route._url : [route._url],
            bestMatch,
            mostMatches = 0;

        for(var i = 0; i < urls.length; i++){
            var routeKey = router.resolve(router.basePath, urls[i]),
                match = url.match('^' + sanitise(routeKey).replace(formatRegex, '(.*?)') + '$');

            if(match && match.length > mostMatches){
                mostMatches = match.length;
                bestMatch = routeKey;
            }
        }

        if(!bestMatch){
            return;
        }

        return {
            path: url,
            name: routeName,
            template: bestMatch
        };
    });
};

Router.prototype.find = function(url){
    var details = this.details.apply(this, arguments);

    return details && details.name;
};

Router.prototype.upOneName = function(name){
    if(!name){
        return;
    }

    return scanRoutes(this.routes, function(route, routeName){
        if(name in route){
            return routeName;
        }
    }) || this.homeRoute;
};

Router.prototype.upOne = function(path){
    if(path === undefined){
        path = window.location.href;
    }

    return this.drill(path, this.upOneName(this.find(path)));
};

Router.prototype.getTemplate = function(name){
    var args = arrayProto.slice.call(arguments, 1),
        url = scanRoutes(this.routes, function(route, routeName){
        if(name === routeName){
            if(!Array.isArray(route._url)){
                return route._url;
            }

            return route._url.filter(function(url){
                var match = url.match(formatRegex);
                if(match && match.length === args.length){
                    return true;
                }
            })[0] || route._url[0];
        }
    });

    if(!url){
        return;
    }

    return this.resolve(this.basePath, url);
};

Router.prototype.get = function(name){
    var template = this.getTemplate.apply(this, arguments);

    return formatString(template, arrayProto.slice.call(arguments, 1));
};

Router.prototype.isIn = function(childName, parentName){
    var currentRoute = childName,
        lastRoute;

    while(currentRoute !== lastRoute && currentRoute !== parentName){
        lastRoute = currentRoute;
        currentRoute = this.upOneName(currentRoute);
    }

    return currentRoute === parentName;
};

Router.prototype.isRoot = function(name){
    return name in this.routes;
};

Router.prototype.values = function(path){
    var details = this.details.apply(this, arguments),
        results;

    if(details == null || details.template == null){
        return;
    }

    results = details.path.match('^' + sanitise(details.template).replace(formatRegex, '(.*?)') + '$');

    if(results){
        return results.slice(1);
    }
};

Router.prototype.drill = function(path, route){
    if(path == null){
        path = window.location.href;
    }
    var newValues = arrayProto.slice.call(arguments, 2);

    var getArguments = this.values(path) || [];

    getArguments = getArguments.concat(newValues);

    getArguments.unshift(route);

    return this.get.apply(this, getArguments);
};

Router.prototype.resolve = resolve;

module.exports = Router;