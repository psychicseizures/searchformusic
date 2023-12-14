import './App.css';
// App.jsx
import React, { useState, useEffect } from 'react';
import { Container, FormGroup, TextField, Button, Grid, Card, CardContent, CardMedia, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';
import finger from "./image/backfinger1.png"

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchResultPopupOpen, setSearchResultPopupOpen] = useState(false);

  useEffect(() => {
    // API Access
    let authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    };

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token));
  }, []);

  // Search
  async function search() {
    console.log("Search initiated.");

    // Use searchParameters to get Artist ID
    let searchParameters = {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist`, searchParameters);
      const data = await response.json();
      const artists = data.artists?.items;

      if (artists && artists.length > 0) {
        const artistID = artists[0].id;
        console.log("Artist ID found: " + artistID);

        // Use Artist ID to get albums from artist
        const returnAlbums = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`, searchParameters);
        const albumsData = await returnAlbums.json();
        setAlbums(albumsData.items);
      } else {
        console.log("No artist found");
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  const selectAlbum = async (album) => {
    let albumDetailsParameters = {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };
  
    try {
      const response = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, albumDetailsParameters);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch album details. Status: ${response.status}`);
      }
  
      const albumDetails = await response.json();
      const selectedAlbumWithDetails = { ...album, releaseDate: albumDetails.release_date };
  
      const trackListResponse = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, albumDetailsParameters);
  
      if (!trackListResponse.ok) {
        throw new Error(`Failed to fetch track list. Status: ${trackListResponse.status}`);
      }
  
      const trackListData = await trackListResponse.json();
  
      console.log("Album Details:", albumDetails);
      console.log("Track List Data:", trackListData);
  
      selectedAlbumWithDetails.tracks = trackListData.items;
  
      console.log("Selected Album with Details:", selectedAlbumWithDetails);
  
      setSelectedAlbum(selectedAlbumWithDetails);
      setSearchResultPopupOpen(true);
    } catch (error) {
      console.error("Error fetching album details:", error);
    }
  };
  

  // Reset button function
  const reset = () => {
    setSearchInput("");
    setAlbums([]);
    setSelectedAlbum(null); // Reset selected album when resetting the search
  };

  // Function to format the track duration
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="App">
      <div className='logo'></div>
      <Container>
        <FormGroup>
          <TextField
            variant='outlined'
            placeholder=""
            type="input"
            color="warning"
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <div className="buttons">
            <Button color='warning' type='reset' className="btn2" onClick={reset}></Button>
            <Button color="warning" className="btn" onClick={search}></Button>
          </div>
        </FormGroup>
      </Container>
      <Container>
        <Grid container spacing={2}>
          {albums.map((album, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i} onClick={() => selectAlbum(album)}>
              <Card>
                <CardMedia component="img" src={album.images[0].url} alt={album.name} />
                <CardContent>
                  <Typography variant="h6">{album.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Display more details for the selected album */}
      {selectedAlbum && (
  <Dialog open={searchResultPopupOpen} onClose={() => setSearchResultPopupOpen(false)}>
    <DialogTitle>{selectedAlbum.name}</DialogTitle>
    <DialogContent>
      <CardMedia component="img" src={selectedAlbum.images[0]?.url} alt={selectedAlbum.name} />
      <Typography variant="body2">Release Date: {selectedAlbum.releaseDate}</Typography>

      {/* Tracklisting */}
      <Typography variant="h6">Tracklisting:</Typography>
      <List>
        {selectedAlbum.tracks && selectedAlbum.tracks.items ? (
          selectedAlbum.tracks.items.map((track, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${track.track_number}. ${track.name}`}
                secondary={`Duration: ${formatDuration(track.duration_ms)}`}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No track information available" />
          </ListItem>
        )}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setSearchResultPopupOpen(false)}>
        <img src={finger} width="100px" alt="Finger Icon" />
      </Button>
    </DialogActions>
  </Dialog>
)}

    </div>
  );
}

export default App;