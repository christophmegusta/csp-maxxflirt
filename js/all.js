/*
@	ENDPOINTS
*/

// DEV
/*
var brev = '292205a';
var currentStage = "http://" + brev + ".stage.backend.megusta.dating/g-db-layer-0.1";
var domainName = 'developer-chat.latest.frontend.megusta.dating';
*/
// PRODUCTION
var currentStage = 'http://5.79.69.70:3000/backend-production/g-db-layer-0.1'
var domainName = window.location.host


/*
@	Saving URL params to localStorage
*/
var paramsKey = 'chat.cspParams';
var storedURL = localStorage.getItem(paramsKey);
var currentURL = window.location.search.substring(1);

/*
@	Cookies lifetime
*/
var sessionTime = 1000 * 60 * 60 * 24 * 14; // last octet is the number of days, 14 in this case
var validTo = new Date(+(new Date) + sessionTime);
var validTo = validTo.toISOString();

/*
@	Base Ajax object
*/
var cspRequest = {
	type: 'POST',
	dataType: 'json',
	encode: true
};

/*
@	Utility - returns object from URL params
@	Example:
@		URL - index.html?q=/profile/search&username=test&password=123
@		Returned Object - {q:'/profile/search',username:'test',password:'123'}
*/
var QueryString = function(query) {
	var arr, i, pair, query_string, vars;
	query_string = {};
	vars = query.split('&');
	i = 0;
	while (i < vars.length) {
		pair = vars[i].split('=');
		if (typeof query_string[pair[0]] === 'undefined') {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
		} else if (typeof query_string[pair[0]] === 'string') {
			arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
		i++;
	}
	return query_string;
};

/*
@	Redirecting to aplication state after successful Register/Login 
*/
var navigateToChat = function(data) {
	 
	var navigateParams = storedURL;
	
	localStorage.removeItem(paramsKey);
	
	if (data.session != null) {
		document.cookie = "shallpass=yes; expires=" + data.session.expires+ "; path=/";
		document.cookie = "chat.currentUser.session.id=" + data.session.sessionHash + "; expires=" + data.session.expires+ "; path=/";
		document.cookie = "chat.currentUser.domainName=" + domainName + "; expires=" + data.session.expires+ "; path=/";
	} else {
		document.cookie = 'shallpass=yes; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/';
		document.cookie = "chat.currentUser.session.id=" + data.sessionHash + "; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/";
		document.cookie = "chat.currentUser.domainName=" + domainName + "; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/";
	}
	if (navigateParams != null) {
		var query = QueryString(navigateParams);
		window.location.href = query.q + "?" + navigateParams;
	} else {
		window.location.href = '/';
	}
};

/*
@	Cleaning error messages on form submission
*/
var cleanFields = function() {
	$('.form-group').removeClass('has-error');
	$('.field-error').remove();
};

/*
@	Checking if redirected from activation email
*/
var checkActivation = function() {
	var currentParams = QueryString(currentURL);
	if (currentParams.securityToken != null) {
		
		// Adding fields data to the request object
		cspRequest.data = {
			securityToken: currentParams.securityToken
		};
		cspRequest.url = currentStage + "/account/activate";

		// Sending form data to the server
		$.ajax(cspRequest).done(function(response) {
			// ERROR response
			// Handling errors from server
			if (response.status !== 'SUCCESS') {
				if (response.globalErrors != null) {
					$('#userRegisterForm').fadeOut();
					$('.form-box').append("<div class='field-error'>" + response.globalErrors[0].message + "</div>");
				}
			} else {
				// SUCCESS
				// Redirecting to chat application
				navigateToChat(response.data);
				return 
			}
		// Handling AJAX errors, rare case	
		}).fail(function(data) {
			return console.error(data);
		});

	}
};


/*
@	Forms handling and initialization
*/
$(document).ready(function() {

	// Check for activation 'securityToken'
	checkActivation();

	/*
		Register New User form
	*/
	$('#userRegisterForm').submit(function(event) {
		
		// Cleaning form fields from error messages
		cleanFields();

		var newEmail = $('#inputEmail').val()
		var newUser = $('#inputUsername').val()
		var newPassword = $('#inputPassword').val()
		
		if (newEmail === '') {
			$('#emailGroup').addClass('has-error');
			$('#emailGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		if (newUser === '') {
			$('#usernameGroup').addClass('has-error');
			$('#usernameGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		if (newPassword === '') {
			$('#passwordGroup').addClass('has-error');
			$('#passwordGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		// Adding fields data to the request object
		cspRequest.data = {
			email:  newEmail,
			username:  newUser,
			password:  newPassword,
			domainName: domainName
		};
		cspRequest.url = currentStage + "/end/user/create";
		
		// Sending form to the server
		$.ajax(cspRequest).done(function(response) {
			// ERROR response
			// Handling errors from server
			if (response.status !== 'SUCCESS') {
				if (response.fieldErrors != null) {
					// Wrong username
					if (response.fieldErrors.username != null) {
						$('#usernameGroup').addClass('has-error');
						$('#usernameGroup').append("<div class='field-error'>" + response.fieldErrors.username[0].message + "</div>");
					}
					
					// Wrong email
					if (response.fieldErrors.email != null) {
						$('#emailGroup').addClass('has-error');
						$('#emailGroup').append("<div class='field-error'>" + response.fieldErrors.email[0].message + "</div>");
					}
					
					// password doesn't meet requirements
					if (response.fieldErrors.password != null) {
						$('#passwordGroup').addClass('has-error');
						$('#passwordGroup').append("<div class='field-error'>" + response.fieldErrors.password[0].message + "</div>");
					}
					// Handling 'already registered email' error
				} else if (response.globalErrors != null) {
					$('#emailGroup').addClass('has-error');
					$('#emailGroup').append("<div class='field-error'>" + response.globalErrors[0].message + "</div>");
				} else {
					// All other errors
					$('#userRegisterForm').append("<div class='field-error'>Something went wrong, please try again later</div>");
				}
			} else {
				// SUCCESS
				// Hiding form and showing 'success message'
				// with the link to 'Login' page
				$('#userRegisterForm').fadeOut();
				$('#success-message').fadeIn();
				return 
			}
		}).fail(function(data) {
			return console.error(data);
		});

		// Preventing default behavior for submit button
		event.preventDefault();
	});

	/*
		Login form
	*/
	$('#loginForm').submit(function(event) {
		// Cleaning form fields from error messages
		cleanFields();
		
		var nameOrEmail = $('#inputEmail').val()
		var password = $('#inputPassword').val()
		
		if (nameOrEmail === '') {
			$('#emailGroup').addClass('has-error');
			$('#emailGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		if (password === '') {
			$('#passwordGroup').addClass('has-error');
			$('#passwordGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		// Adding fields data to the request object
		cspRequest.data = {
			nameOrEmail: nameOrEmail,
			password: password,
			domain: domainName,
			validTo: validTo
		};
		cspRequest.url = currentStage + "/account/login";

		// Sending login data ti the server
		$.ajax(cspRequest).done(function(response) {
			var error, j, len, ref, ref1, results;
			// ERROR response
			// Handling errors from server
			if (response.status !== 'SUCCESS') {
				// Wrong Email or Username
				if (((ref = response.globalErrors) != null ? ref.length : void 0) > 0) {
					ref1 = response.globalErrors;
					results = [];
					for (j = 0, len = ref1.length; j < len; j++) {
						error = ref1[j];
						results.push($('#passwordGroup').append("<div class='field-error'>" + error.message + "</div>"));
					}
					return results;
				// All other Errors
				} else {
					return $('#passwordGroup').append("<div class='field-error'>Something went wrong, please try again later</div>");
				}
			} else {
				// SUCCESS
				// Redirecting to chat application
				navigateToChat(response.data);
			}
		// Handling AJAX errors, rare case			
		}).fail(function(data) {
			return console.error(data);
		});

		// Preventing default behavior for submit button
		event.preventDefault();
	});

	/*
		Restore Password form
	*/
	$('#restoreForm').submit(function(event) {
		// Cleaning form fields from error messages
		cleanFields();
		
		var restoreEmail = $('#inputEmail').val()
		
		if (restoreEmail === '') {
			$('#emailGroup').addClass('has-error');
			$('#emailGroup').append("<div class='field-error'>Vallue can't be empty</div>");
			return false
		}

		// Adding fields data to the request object
		cspRequest.data = {
			nameOrEmail: restoreEmail,
			domain: domainName
		};
		cspRequest.url = currentStage + "/account/lost/password";

		// Sending form data to the server
		$.ajax(cspRequest).done(function(response) {
			var error, j, len, ref, ref1, results;
			// ERROR response
			// Handling errors from server
			if (response.status !== 'SUCCESS') {
				if (((ref = response.globalErrors) != null ? ref.length : void 0) > 0) {
					ref1 = response.globalErrors;
					results = [];
					for (j = 0, len = ref1.length; j < len; j++) {
						error = ref1[j];
						results.push($('#emailGroup').append("<div class='field-error'>" + error.message + "</div>"));
					}
					return results;
				} else {
					$('#emailGroup').append("<div class='field-error'>Something went wrong, please try again later</div>");
				}
			} else {
				// SUCCESS
				// Hiding form and showing 'success message'
				// with the link to 'Login' page
				$('#restoreForm').fadeOut();
				$('#success-message').fadeIn();
				return 
			}
		// Handling AJAX errors, rare case	
		}).fail(function(data) {
			return console.error(data);
		});

		// Preventing default behavior for submit button
		event.preventDefault();
	});

	// Checking if URL params was previously saved
	// If not they will be defined from current URL
	// If visitor comes from email activation link - 
	// activation request is sending immediately after parsing token at checkActivation()
	if (!storedURL && currentURL.length > 0) {
		localStorage.setItem(paramsKey, currentURL);
	}

	// Generating current year in the footer area
	$('#copyright-year').html(new Date().getFullYear());

});