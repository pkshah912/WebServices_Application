/* 
    Author: Pooja Shah
    Created on: Feb 24, 2017
 */

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global OAuth, google */

$(document).ready(function(){
    var searchRecipeName = "";
    // This is an event when you click on button on what recipes you want to search
    $('.searchRecipe').click(function() {
        
        // Gets the value of the food recipe entered by the user
        searchRecipeName = $("#foodName").val();
        
        // If user has not entered the recipe he wants to search, 
        // alert box will be displayed to enter the recipe
        if(searchRecipeName === ""){
            alert("Please enter name of recipe you want to look for..");
            return false;
        } 
        // It fetches the data from service if the user enters the recipe he wants to search
        else{
            // This is URL for Edamam API to fetch the food recipe
            var foodRecipeURL = "https://api.edamam.com/search";
            
            // This is App ID for food recipe
            // Add your keys
            var foodRecipeAppID = "YOUR_KEY";
            
            // This is App ID for food recipe
            // Add your keys
            var foodRecipeAppKey = "YOUR_KEY";
            // This is an AJAX call which will fetch the data from Edamam API
            $.ajax({
               url: foodRecipeURL,
               type: 'get',
               // These are the parameters that needs to be passed while fetching
               // the data from Edamam API
               // q : It is the recipe name you want to search for
               data: {q: searchRecipeName, app_id: foodRecipeAppID, app_key: foodRecipeAppKey},
               // The data response in JSON format
               dataType: 'json',
               success: function(response){
                   // These empty functions are used to clear the screen 
                   // on change of recipe name search
                   $(".recipeResults").empty();
                   $(".displayRecipe").empty();
                   $(".ingredientsTitle").empty();
                   $(".displayIngredients").empty();
                   $(".preparationSteps").empty();
                   $(".nearbyRestaurants").empty();
                   $("#map").empty();
                   $(".otherDetails").empty();
                   $(".restDetails").empty();
                   $(".restImg").empty();
                   // This is the response from the API
                   recipeArray = response.hits;
                   var string = "";
                   // This is used to display the name of recipes on the web page
                   $.each(recipeArray, function(key, element){
                       string +="<li>" + element.recipe.label + "</li>";
                   });
                   $(".recipeResults").append(string);
                   var recipeName="";
                   
                   // This is a click functionality of a particular webpage
                   $(".recipeResults").on('click',"li", function() { 
                        $("#map").empty();
                        $(".otherDetails").empty();
                        $(".restDetails").empty();
                        $(".restImg").empty();
                        var ingredients = "";
                        
                        // Gets the index of a particular clicked recipe 
                        // to fetch its details
                        currentIndex = $(this).index();
                        var imageURL = recipeArray[currentIndex].recipe.image;
                        recipeName = recipeArray[currentIndex].recipe.label;
                        var recipeSource = recipeArray[currentIndex].recipe.source;
                        var calories = recipeArray[currentIndex].recipe.calories.toFixed(2);
                        var recipeIngredients = recipeArray[currentIndex].recipe.ingredientLines;
                        var preparationURL = recipeArray[currentIndex].recipe.url;
                        $(".displayRecipe").empty();
                        // Adds the image of recipe
                        $(".displayRecipe").append("<img src = '" + 
                                            imageURL + 
                                            "' class = 'recipeImage'>"); 
                        // Adds the recipe details and ingredients
                        $(".displayRecipe").append("<div class='recipeNameDiv'>\n\
                                                <div><span class='recipeName'>" + 
                                                recipeName + 
                                                "</span></div>\n\
                                                <div class='chefDiv'><span> Source: "+ recipeSource + "</span></div>\n\
                                                <div class='caloriesDiv'><span>Calories: " + calories + " cal</span></div></div>");
                        for(var index = 0; index<recipeIngredients.length;index++){
                            ingredients += "<li>" + recipeIngredients[index] + "</li>";
                        }
                        $(".ingredientsTitle").empty();
                        $(".ingredientsTitle").append("Ingredients:");
                        $(".displayIngredients").empty();
                        $(".displayIngredients").append(ingredients);
                        $(".preparationSteps").empty();
                        // This is used to redirect to a page to show the 
                        // preparation steps
                        $(".preparationSteps").append("<a href='" + preparationURL + 
                                                "' target = '_blank' class='linkButton'>Instructions</a>");
                        $(".nearbyRestaurants").empty();
                        $(".nearbyRestaurants").prepend("<input type='button' value='Where is my food?' \n\
                                                name='searchRestaurants' class='searchRestaurants'/>");
                       $(".nearbyRestaurants").prepend("Enter city: \n\
                                                <input type='text' name='nearbyRestaurants' id='nearbyRestaurants'/>");
                       $(".nearbyRestaurants").append("<ul class='restaurantResults'></ul>");
                    });
                    
                    var searchRestaurants = "";
                    // When you enter the name of city, it locates restaurants serving that food
                    $('.nearbyRestaurants').on('click', '.searchRestaurants', function(){
                        // Gets the name of the city entered by the user
                       searchRestaurants =  $("#nearbyRestaurants").val();
                       // If the city name is not entered, user is given a message
                       // to enter the city
                       if(searchRestaurants === ""){
                           alert("Please enter city");
                           return false;
                       } else{
                            $("#map").empty();
                            $(".otherDetails").empty();
                            $(".restDetails").empty();
                            $(".restImg").empty();
                            $(".restaurantResults").empty();
                            
                            // These are the Yelp API keys to fetch the data
                            // Add your keys
                            var consumerKey = "YOUR_KEY";
                            var consumerSecret = "YOUR_KEY";
                            var accessToken = "YOUR_KEY";
                            var accessTokenSecret = "YOUR_KEY";
                            // This includes the private keys that needs to be 
                            // signed when sending request
                            var accessor = {
                                consumerSecret: consumerSecret,
                                tokenSecret: accessTokenSecret
                            };
                            // Parameters that needs to be sent when requesting for data
                            parameters = {
                                'term': recipeName,
                                'location': searchRestaurants,
                                'callback': 'cb',
                                'oauth_consumer_key': consumerKey,
                                'oauth_consumer_secret': consumerSecret,
                                'oauth_token': accessToken,
                                'oauth_signature_method': 'HMAC-SHA1'
                            };
                            var message = {
                                action: 'http://api.yelp.com/v2/search',
                                method: 'GET',
                                parameters: parameters
                            };
                            // Signing the message for authentication
                            OAuth.setTimestampAndNonce(message);
                            OAuth.SignatureMethod.sign(message, accessor);
                            var parameterMap = OAuth.getParameterMap(message.parameters);
                            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
                            $.ajax({
                                url: message.action,
                                data: parameterMap,
                                cache: true,
                                dataType: 'jsonp',
                                jsonpCallback: 'cb',
                                success: function(data) {
                                    var restaurantsList = "";
                                    businessData = data.businesses;
                                    
                                    // Displays the restaurant list
                                    $.each(businessData, function(key, element){
                                        restaurantsList +="<li>" + element.name + "</li>";
                                    });
                                    $(".restaurantResults").empty();
                                    if(restaurantsList === ""){
                                        alert("No nearby restaurants found");
                                    } else{
                                        $(".restaurantResults").append(restaurantsList);
                                    }
                                    
                                    // On click of restaurant, display details
                                    $(".restaurantResults li").bind('click', function() { 
                                        index = $(this).index();
                                        latitude = businessData[index].location.coordinate.latitude;
                                        longitude = businessData[index].location.coordinate.longitude;
                                        var restImgURL = businessData[index].image_url;
                                        var restaurantName = businessData[index].name;
                                        var address = businessData[index].location.display_address;
                                        var displayAdd= "";
                                        var phone = businessData[index].display_phone;
                                        var ratings = businessData[index].rating;
                                        for(var i=0;i<address.length;i++){
                                            if(i === address.length-1){
                                                displayAdd += address[i];
                                            } else{
                                                displayAdd += address[i] + ", ";
                                            }
                                        }
                                        findRestaurant(latitude, longitude);
                                        $(".restImg").empty();
                                        $(".restImg").append("<img src = '" + 
                                                                restImgURL + 
                                                                "' class = 'restaurantImg'>");
                                        $(".restDetails").empty();
                                        $(".restDetails").append("<div class='nameRest'><span class='restaurantName'>" + 
                                                                    restaurantName + "</span></div>\n\
                                                                  <div class='addressDiv'><span class='displayAdd'>" + displayAdd + "</span></div>");
                                        $(".otherDetails").empty();
                                        $(".otherDetails").append("<div class='phoneDisplay'><span class='phone'> Contact: " + 
                                                                    phone + "</span></div>\n\
                                                                  <div class='ratingDiv'><span class='rating'> Ratings: " + ratings + "</span></div>");
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
    // This function is used to locate the restaurant on Google Maps
    // and generate markers on the Google Maps
    function findRestaurant(latitude, longitude)
    {
        // Sets the map center to the latitude and longitude of 
        // the clicked restaurant
        var mapCenter = new google.maps.LatLng(latitude, longitude);
        var map;
        var mapOptions =
        {
            center: mapCenter,
            zoom: 13, 
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
             },
            scaleControl: true, 
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var marker = new google.maps.Marker({
            map: map,
            position: mapCenter,
            animation: google.maps.Animation.DROP,
            icon: "http://maps.google.com/mapfiles/ms/micons/blue.png"
        });
    }
});