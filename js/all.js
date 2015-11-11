
/*brev = 'edbafb8'
currentStage = "http://#{brev}.stage.backend.megusta.dating/g-db-layer-0.1"
domainName = "developer-chat.latest.frontend.megusta.dating"
 */
var QueryString, currentStage, currentURL, domainName, navigateToChat, paramsKey, storedURL;

currentStage = 'http://82.220.91.232:3000/backend-production/g-account-api-0.1';

domainName = window.location.host;

paramsKey = 'chat.cspParams';

storedURL = localStorage.getItem(paramsKey);

currentURL = window.location.search.substring(1);

QueryString = function(query) {
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

navigateToChat = function(data) {
  var navigateParams, query;
  navigateParams = storedURL;
  localStorage.removeItem(paramsKey);
  document.cookie = 'shallpass=yes; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/';
  document.cookie = "chat.currentUser.session.id=" + data.sessionHash;
  if (navigateParams != null) {
    query = QueryString(navigateParams);
    window.location.href = query.q + "?" + navigateParams;
  } else {
    window.location.href = '/';
  }
};

$(document).ready(function() {
  $('#userRegisterForm').submit(function(event) {
    var formData;
    $('.form-group').removeClass('has-error');
    $('.field-error').remove();
    formData = {
      email: $('#inputEmail').val(),
      username: $('#inputUsername').val(),
      password: $('#inputPassword').val(),
      domainName: domainName
    };
    $.ajax({
      type: 'POST',
      url: currentStage + "/end/user/create",
      data: formData,
      dataType: 'json',
      encode: true
    }).done(function(response) {
      if (response.status !== 'SUCCESS') {
        if (response.fieldErrors != null) {
          if (response.fieldErrors.username != null) {
            $('#usernameGroup').addClass('has-error');
            $('#usernameGroup').append("<div class='field-error'>" + response.fieldErrors.username[0].message + "</div>");
          }
          if (response.fieldErrors.email != null) {
            $('#emailGroup').addClass('has-error');
            $('#emailGroup').append("<div class='field-error'>" + response.fieldErrors.email[0].message + "</div>");
          }
          if (response.fieldErrors.password != null) {
            $('#passwordGroup').addClass('has-error');
            return $('#passwordGroup').append("<div class='field-error'>" + response.fieldErrors.password[0].message + "</div>");
          }
        } else {
          return $('#userRegisterForm').append("<div class='field-error'>Something went wrong, please try again later</div>");
        }
      } else {
        return navigateToChat(response.data);
      }
    }).fail(function(data) {
      console.log(data);
    });
    event.preventDefault();
  });
  $('#loginForm').submit(function(event) {
    var formData, sessionTime, validTo;
    $('.form-group').removeClass('has-error');
    $('.field-error').remove();
    sessionTime = 1000 * 60 * 60 * 24 * 14;
    validTo = new Date(+(new Date) + sessionTime);
    validTo = validTo.toISOString();
    formData = {
      nameOrEmail: $('#inputEmail').val(),
      password: $('#inputPassword').val(),
      domain: domainName,
      validTo: validTo
    };
    $.ajax({
      type: 'POST',
      url: currentStage + "/account/login",
      data: formData,
      dataType: 'json',
      encode: true
    }).done(function(response) {
      var error, j, len, ref, ref1, results;
      if (response.status !== 'SUCCESS') {
        if (((ref = response.globalErrors) != null ? ref.length : void 0) > 0) {
          ref1 = response.globalErrors;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            error = ref1[j];
            results.push($('#passwordGroup').append("<div class='field-error'>" + error.message + "</div>"));
          }
          return results;
        } else {
          return $('#passwordGroup').append("<div class='field-error'>Something went wrong, please try again later</div>");
        }
      } else {
        return navigateToChat(response.data);
      }
    }).fail(function(data) {
      console.error(data);
    });
    event.preventDefault();
  });
  $('#restoreForm').submit(function(event) {
    var formData;
    $('.form-group').removeClass('has-error');
    $('.field-error').remove();
    formData = {
      nameOrEmail: $('#inputEmail').val(),
      domain: domainName
    };
    $.ajax({
      type: 'POST',
      url: currentStage + "/account/lost/password",
      data: formData,
      dataType: 'json',
      encode: true
    }).done(function(response) {
      var error, j, len, ref, ref1, results;
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
          return $('#emailGroup').append("<div class='field-error'>Something went wrong, please try again later</div>");
        }
      } else {
        return navigateToChat();
      }
    }).fail(function(data) {
      console.error(data);
    });
    event.preventDefault();
  });
  if (!storedURL && currentURL.length > 0) {
    localStorage.setItem(paramsKey, currentURL);
  }
  $('#copyright-year').html(new Date().getFullYear());
});
