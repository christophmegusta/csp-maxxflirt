# Development
###brev = 'edbafb8'
currentStage = "http://#{brev}.stage.backend.megusta.dating/g-db-layer-0.1"
domainName = 'developer-chat.latest.frontend.megusta.dating'###

# Production
currentStage = 'http://82.220.91.232:3000/backend-production/g-db-layer-0.1'
domainName = window.location.host

# Local Storage
paramsKey = 'chat.cspParams'
storedURL = localStorage.getItem(paramsKey)
currentURL = window.location.search.substring(1)

# Session stuff
sessionTime = 1000 * 60 * 60 * 24 * 14 # 14 days
validTo = new Date(+new Date + sessionTime)
validTo = validTo.toISOString()

# Default request object
cspRequest =
    type: 'POST'
    dataType: 'json'
    encode: true

# http://stackoverflow.com/a/979995
QueryString = (query) ->
    # This function is anonymous, is executed immediately and 
    # the return value is assigned to QueryString!
    query_string = {}
    vars = query.split('&')
    i = 0
    while i < vars.length
        pair = vars[i].split('=')
        # If first entry with this name
        if typeof query_string[pair[0]] == 'undefined'
            query_string[pair[0]] = decodeURIComponent(pair[1])
            # If second entry with this name
        else if typeof query_string[pair[0]] == 'string'
            arr = [
                query_string[pair[0]]
                decodeURIComponent(pair[1])
            ]
            query_string[pair[0]] = arr
            # If third or later entry with this name
        else
            query_string[pair[0]].push decodeURIComponent(pair[1])
        i++
    query_string

#
# Redirecting to SPA and passing parameters
#
navigateToChat = (data)->
    navigateParams = storedURL
    localStorage.removeItem paramsKey
    document.cookie = 'shallpass=yes; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/'
    document.cookie = "chat.currentUser.session.id=#{data.sessionHash}; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/"
    document.cookie = "chat.currentUser.domainName=#{domainName}; expires=Thu, 18 Dec 2018 12:00:00 UTC; path=/"
    if navigateParams?
        query = QueryString navigateParams
        window.location.href = query.q + "?" + navigateParams
    else
        window.location.href = '/'
    return
#
#   Cleaning error messages
#
cleanFields = ->
    $('.form-group').removeClass 'has-error'
    $('.field-error').remove()
    return

$(document).ready ->
    #
    # Register user
    #
    $('#userRegisterForm').submit (event) ->
        
        cleanFields()

        cspRequest.data = 
            email: $('#inputEmail').val()
            username: $('#inputUsername').val()
            password: $('#inputPassword').val()
            domainName: domainName
        cspRequest.url = "#{currentStage}/end/user/create"
 
        $.ajax cspRequest
        .done((response) ->
            unless response.status is 'SUCCESS'
                if response.fieldErrors?
                    if response.fieldErrors.username?
                        $('#usernameGroup').addClass('has-error')
                        $('#usernameGroup').append "<div class='field-error'>#{response.fieldErrors.username[0].message}</div>"
                    if response.fieldErrors.email?
                        $('#emailGroup').addClass('has-error')
                        $('#emailGroup').append "<div class='field-error'>#{response.fieldErrors.email[0].message}</div>"
                    if response.fieldErrors.password?
                        $('#passwordGroup').addClass('has-error')
                        $('#passwordGroup').append "<div class='field-error'>#{response.fieldErrors.password[0].message}</div>"
                else
                    $('#userRegisterForm').append "<div class='field-error'>Something went wrong, please try again later</div>"
            else
                navigateToChat(response.data)
        ).fail (data) -> console.log data
        
        event.preventDefault()
        return
    
    #
    # Login
    #
    $('#loginForm').submit (event) ->
        
        cleanFields()

        cspRequest.data = 
            nameOrEmail: $('#inputEmail').val()
            password: $('#inputPassword').val()
            domain: domainName
            validTo: validTo
        cspRequest.url = "#{currentStage}/account/login"
 
        $.ajax cspRequest
        .done((response) ->
            unless response.status is 'SUCCESS'
                if response.globalErrors?.length > 0
                    for error in response.globalErrors
                        $('#passwordGroup').append "<div class='field-error'>#{error.message}</div>"
                else
                    $('#passwordGroup').append "<div class='field-error'>Something went wrong, please try again later</div>"
            else
                navigateToChat(response.data)
        ).fail (data) -> console.error data
        
        event.preventDefault()
        return

    #
    # Forgot password
    #
    $('#restoreForm').submit (event) ->
        
        cleanFields()

        cspRequest.data = 
            nameOrEmail: $('#inputEmail').val()
            domain: domainName
        cspRequest.url = "#{currentStage}/lost/password"
 
        $.ajax cspRequest
        .done((response) ->
            unless response.status is 'SUCCESS'
                if response.globalErrors?.length > 0
                    for error in response.globalErrors
                        $('#emailGroup').append "<div class='field-error'>#{error.message}</div>"
                else
                    $('#emailGroup').append "<div class='field-error'>Something went wrong, please try again later</div>"
            else
                $('#restoreForm').fadeOut()
                $('#success-message').fadeIn()
        ).fail (data) -> console.error data
        
        event.preventDefault()
        return

    #
    # Persisting location params
    #
    if !storedURL and currentURL.length > 0
        localStorage.setItem paramsKey, currentURL

    # setting copyright current year
    $('#copyright-year').html(new Date().getFullYear())
    return