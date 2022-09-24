
var accessToken;

const GetAccessToken = async () => {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa('d36ae0e38b4c4ae8b77a6c185f4803c9' + ':' + '7816e2ea4603412cae27d79003e70c84')
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

var error = "<article><p>There is a problem with the imput you provided please try again!</p></article>"

async function appendArtist(artistID){
    
    
    if(accessToken == null){
        accessToken = await GetAccessToken();
    }

    var spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getArtist(artistID, function(err, data){
        if(err) {
            console.error(err);
            $("#factsHere").append(error);
            
        }else{
            var artistInfo = "<div id='"+artistID+"' class ='artistInfo'>" +
            "<div class='artistHead'></div>"+
            "<div class='genres subA'><h3>Generes:</h3><ul class='gList'></ul></div>"+
            "<div class='aTopTracks subA'><h3>Top Tracks:</h3><ol class='tTracks'></ol></div>"+
            "<div class='albums subA'><h3>Artist's Albums</h3><ul class='artAlbums'></ul></div>"+
            "<div class='relatedArt subA'><h3>Related Artists</h3><ul class='moreArt'></ul></div></div>";
            $("#factsHere").append(artistInfo);
            console.log("Artist Data:", data);
            var artist = data;
            console.log(artist);
            var albums;
            var topTracks;
            var relatedArtists;
            var baseInfo = "<a href='" +artist.external_urls.spotify+"'target='_blank' class='circle'><img src='" +artist.images[0].url+"'/> </a>";
            baseInfo += "<div class='artDeets'><h2>" +artist.name+"</h2><div class=smallDeets><h4>Followers: </h4><p> " +artist.followers.total+"</p></div><div class=smallDeets><h4>Popularity: </h4><p>" +artist.popularity+"/100</p></div>";
            $( "#"+artistID+" >.artistHead").append(baseInfo);
            var genreS= "";
            for(i=0; i<artist.genres.length; i++){
                genreS+= "<li>"+artist.genres[i]+"</li>";
            }
            $( "#"+artistID+" .gList").append(genreS);

            spotifyApi.getArtistTopTracks(artist.id, "US", function(err, data){
                if(err) {
                    console.error(err);
                }
                else {
                    topTracks = data.tracks;
                    console.log(topTracks);
                    var tiptops = '';
                    for(i=0; i<topTracks.length; i++){
                        var trackOb = "<li class='aTrack'>";
                        trackOb+="<a href='"+topTracks[i].external_urls.spotify+"'target='_blank'><img src='"+topTracks[i].album.images[0].url+"' class='trackImg'/></a>";
                        trackOb+="<aside class='tInfo'><p class='tName'>";
                        if(topTracks[i].explicit==true){
                            trackOb+= "<span class='explicit'>E</span>";
                        }
                        trackOb+=topTracks[i].name+"</p>";
                       
                        var millis = topTracks[i].duration_ms;
                        var minutes = Math.floor(millis / 60000);
                        var seconds = ((millis % 60000) / 1000).toFixed(0);
                        trackOb += "<p class='time'>" + minutes + ":" +seconds +"</p>";
                        trackOb += "</aside><div class='clear'></div></li>"
                        tiptops += trackOb;
                    }
                    $( "#"+artistID+" .tTracks").append(tiptops);
        
                }
            });

            spotifyApi.getArtistAlbums(artist.id, function(err, data){
                if(err) {
                    console.error(err);
                }
                else { 
                    albums = data.items;
                    console.log(albums);
                    var aAlbs = "";
                    for(i=0;i<albums.length;i++){
                    var thisAll="<li class='anAlbum'>";
                    thisAll+="<a href='"+albums[i].external_urls.spotify+"' target='_blank'><img  class='albImg' src='" +albums[i].images[0].url+"'/></a>";
                    thisAll+="<aside class='aInfo'><p class='albName'>" + albums[i].name+"</p>";
                        let d = new Date(albums[i].release_date);
                        let month = d.getMonth()+1;
                        let letterMonth;
                        switch(month){
                            case 1:
                                letterMonth = "January";
                                break;
                            case 2:
                                letterMonth = "February";
                                break;
                            case 3:
                                letterMonth = "March";
                                break;
                            case 4:
                                letterMonth = "April";
                                break;
                            case 5:
                                letterMonth = "May";
                                break;
                            case 6:
                                letterMonth = "June";
                                break;
                            case 7:
                                letterMonth = "July";
                                break;
                            case 8:
                                letterMonth = "August";
                                break;
                            case 9:
                                letterMonth = "September";
                                break;
                            case 10:
                                letterMonth = "October";
                                break;
                            case 11:
                                letterMonth = "November";
                                break;
                            case 12:
                                letterMonth = "December";
                                break;
                        }
                    thisAll += "<p class='aRelease'>" + letterMonth + " " + d.getFullYear()+ "</p>";
                    thisAll+="</aside></li>";
                    aAlbs+= thisAll;
                    }

                    $('.artAlbums').append(aAlbs);
                }
            });

            spotifyApi.getArtistRelatedArtists(artist.id, function(err, data){
                if(err) {
                    console.error(err);
                }
                else {
                    relatedArtists = data.artists;
                    console.log(relatedArtists);
                    var relation = "";

                    for(i=0; i<relatedArtists.length; i++){
                        var thisArtist = "<li class='moreArtLi' data-artist-id='" + relatedArtists[i].id+"'>";
                        thisArtist += "<img class='newGuy' src='"+relatedArtists[i].images[0].url + "'/>";
                        thisArtist+= "<h4 class='relName'>"+relatedArtists[i].name+"</h4>";
                        thisArtist += "</li>";
                        relation += thisArtist;
                    }

                    $( "#"+artistID+" .moreArt").append(relation);
                    $(".moreArtLi").click(function(){

                        var relartistiId= $(this).data("artist-id");
                    
                        appendArtist(relartistiId);
                        console.log(relartistiId);
                    
                    
                    });
                }
            });
        }

    });
}

$("#submitFacts").click(async() =>{

    $(".hideAway").hide();

    if(accessToken == null){
        accessToken = await GetAccessToken();
    }

    var spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);

    var artistVal = $("#artist").val();

    spotifyApi.searchArtists(artistVal).then(
        function (data) {
            console.log("Artist Data:", data);
            var artistid = data.artists.items[0].id;
            appendArtist(artistid);

        },
        function (err) {
            console.error(err);
        }

    ); 
});

$("#submit").click(async() =>{

    if(validateNums()){

        $(".hideAway").hide();

        if(accessToken == null){
            accessToken = await GetAccessToken();
        }

        var spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);
        var artistVal = $("#artist").val();

        spotifyApi.searchArtists(artistVal).then(
            function (data) {
        
                var artistid = data.artists.items[0].id;
                var range = $("#trackRange").val();
                var popular = $("#popular").val();
                var energy = $("#energy").val();
                var vocals = $("#vocals").val();
                var dance = $("#dance").val();
                var mood = $("#mood").val();
                var accoustic = $("#accoustic").val();

                var test = { 
                    limit: range,
                    seed_artists: [artistid],
                    target_danceability: dance,
                    target_energy: energy,
                    target_popularity : popular,
                    target_speechiness: vocals, 
                    target_acousticness: accoustic,
                    target_liveness: mood
                };

                spotifyApi.getRecommendations(test, function(err, data){
                    if(err) {
                        console.error(err);
                        $("#songs").append(error);

                    }
                    else {
                       let tracks = data.tracks;
                       var songTable = "<table><thead><tr><th scope='col'>Track Number</th><th scope='col'>Image</th><th scope='col'>Title</th><th scope='col'>Artist</th><th scope='col'>Duration</th></tr></thead><tbody>";
                        count = 1;
                        for(i=0; i<tracks.length; i++){
                        
                            var row = "<tr>";
                            row += "<th scope='row'>"+count +"</th>";
                            row += "<td><a href ='"+tracks[i].external_urls.spotify+"target='_blank'><img src='"+tracks[i].album.images[0].url+"'/></a></td>";
                            row+= "<td>";
                            if(tracks[i].explicit==true){
                                row+= "<span class='explicit'>E</span>";
                            }
                            row+=tracks[i].name+"</td>";
                            row += "<td>";
                            for(j=0; j<tracks[i].artists.length; j++){
                                row += tracks[i].artists[j].name +"</br>";
                            }
                            row+="</td>";
                            var millis = tracks[i].duration_ms;
                            var minutes = Math.floor(millis / 60000);
                            var seconds = ((millis % 60000) / 1000).toFixed(0);
                            row+= "<td>"+minutes+":"+seconds+"</td>";
                            row +="</tr>";
                            count ++;
                            songTable+=row;
                        }
                        songTable+= "</tbody></table>"
                        $("#songs").append(songTable);
                    }
            
                });
        
            },
            function (err) {
                console.error(err);
            }
        );
    }


});

function validateNums(){
    var OnetoHundredRegex = /^[1-9][0-9]?$|^100$/;
    let x = $("#trackRange").val();
    var numTest = OnetoHundredRegex.test(x);
    if(numTest != true){
        alert("Number is out of range please try again!")
        return false;
    }

    return true;
}