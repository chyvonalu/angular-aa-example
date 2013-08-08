(function() {
	var app = angular.module('app', []);



	var pages = [{
		title: 'Guest Page 1',
		path: '/guest1',
		template: 'guest1',
		accessibleFor: ['guest']
	}, {
		title: 'Guest Page 2',
		path: '/guest2',
		template: 'guest2',
		accessibleFor: ['guest']
	}, {
		title: 'User Page 1',
		path: '/user1',
		template: 'user1',
		accessibleFor: ['user']
	}, {
		title: 'User Page 2',
		path: '/user2',
		template: 'user2',
		accessibleFor: ['user']
	}, {
		title: 'Admin Page 1',
		path: '/admin1',
		template: 'admin1',
		accessibleFor: ['admin']
	}, {
		title: 'Admin Page 2',
		path: '/admin2',
		template: 'admin2',
		accessibleFor: ['admin']
	}];



	app.controller('SideBarController', ['$scope', function($scope) {}]);

	app.controller('TopBarController', ['$scope', '$http', 'user', function($scope, $http, user) {
		var model = {};

		_.extend($scope, {
			model: model,
			credentials: {}
		});

		$scope.login = function() {
			model.state = 'busy';
			$http.post('/rest/login', $scope.credentials)
				.success(function(data) {
					user.login(_.pick(data, 'name', 'roles'));
				})
				.error(function() {
					model.state = 'error';
				});
			$scope.credentials.pw = '';
		}

		$scope.logout = function() {
			model.state = 'busy';
			$http.post('/rest/logout').success(user.logout.bind(user));
		}
	}]);



	app.factory('user', ['$http', '$location', function($http, $location) {
		var guest = {
			name: 'Guest',
			roles: ['guest'],
			loggedIn: false
		};

		return _.extend({}, guest, {
			hasAccessTo: function(route) {
				return !!_.intersection(this.roles, route.accessibleFor).length;
			},
			login: function(data) {
				console.log('logging in as', data.name);

				_.extend(this, {
					loggedIn: true
				}, data);

				this.pages = _.filter(pages, this.hasAccessTo.bind(this));
				$location.path(this.pages[0].path);
			},
			logout: function() {
				this.login(guest);
			}
		});
	}]);



	// setup routes for our pages
	app.config(['$routeProvider', function($routeProvider) {
		_.each(pages, function(page) {
			$routeProvider.when(page.path, {
				templateUrl: '/pages/' + page.template + '.html',
				controller: page.controller,
				accessibleFor: page.accessibleFor,
				page: page
			});
		});
		// dirty trick to redirect to the default page
		$routeProvider.otherwise({redirectTo: '/not-available-page'});
	}]);




	app.run(['$rootScope', 'user', '$location', '$http', function($rootScope, user, $location, $http) {
		// redirect an user from pages, he doesn't have an access to, to his default page
		$rootScope.$on('$routeChangeStart', function(event, route) {
			var hasAccess = user.hasAccessTo(route);
			console.log('$routeChangeStart', 'hasAccess:', hasAccess, arguments);
			if (!hasAccess) {
				event.preventDefault();
				var path = user.pages[0].path;
				console.log('user', user.roles, 'doesn\'t have an acces to', $location.path(), 'redirecting to', path);
				$location.path(path);
			}
		});

		// make the current page available everywhere
		$rootScope.$on('$routeChangeSuccess', function(event, route) {
			$rootScope.page = route.page;
		});

		// make the user available everywhere
		$rootScope.user = user;

		// we are a guest at first
		user.logout();

		// do an auto-login, if there still is a session on the server
		$http.get('/rest/login')
			.success(function(data) {
				console.log('session found', arguments);
				user.login(data);
			})
			.error(function() {
				console.log('no session found');
			})
	}]);



	// do a logout when facing 401 (which should mean a session has expired on the server)
	app.factory('AuthHttpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
		console.log('creating AuthHttpInterceptor', arguments);
		return function(promise) {
			return promise.then(function(response) {
				return response;
			}, function(response) {
				if (response.status == 401) {
					$rootScope.user.afterLogout();
				}
				return $q.reject(response);
			});
		};
	}]);

	app.config(['$httpProvider', function($httpProvider) {
		$httpProvider.responseInterceptors.push('AuthHttpInterceptor');
	}]);



	app.directive('busy', function() {
		return {
			restrict: 'E',
			link: function($scope, elem, attr) {
				var img = document.createElement('img');
				img.setAttribute('src', '/icons/small-busy-icon.gif');
				elem[0].appendChild(img);
			}
		}
	});



})();