// SelectedAlbumDetails.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, CardMedia, Typography, Button } from '@mui/material';

function AlbumDetails({ isOpen, onClose, album }) {
  if (!isOpen || !album) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{album.name}</DialogTitle>
      <DialogContent>
        <CardMedia component="img" src={album.images[0].url} alt={album.name} />
        <Typography variant="body2">Release Date: {album.releaseDate}</Typography>
        {/* Add more details as needed */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlbumDetails;
