import React, { useState, useEffect } from "react";

// Material UI
import {Button} from '@material-ui/core';
import { Grid } from "@material-ui/core";

const Album = () => {
  const max = 50;

  // Use State for Images.
  const [images, setImages] = useState([]);
  const [limit, setLimit] = useState(10);

  // API
  const api = "https://jsonplaceholder.typicode.com/photos";

  // On Mount Call API & Filter Data
  useEffect(() => {
    fetchImages();
  }, [limit, images]);

  // Fetch Data
  const fetchImages = () => {
        // Call the API
        fetch(api)
        .then((res) => res.json())
        .then((data) => {
          // Filter to Even albumId only
          const filterData = data.filter((x) => x.albumId % 2 === 0);
          // Filter the first from every even object || I have asked for help with this code. This part is out of my league so far.
          const uniqueItems = filterData.reduce((accumulator, item) => {
            const isDuplicateItem = accumulator.find(
              (i) => i.albumId === item.albumId
            );
            if (!isDuplicateItem) {
              return [...accumulator, item];
            }
  
            return accumulator;
          }, []);
          
          setImages(uniqueItems);
        })
        .catch((err) => console.log(err));
  }

  // Handle Load More Button to show 10 more until 50 max
  const handleShowMoreImages = (e) => {
    e.preventDefault();
    if(limit < max) {
      const newLimit = limit + 10;
      setLimit(newLimit)
      console.log(newLimit)
    }
  };

  return (
    <div>
      <Grid container spacing={6} justify="center" style={{ marginTop: 50 }}>
       
        { // Slice to get only 10 images intially
        images.slice(0, limit).map((album) => (
          <Grid item key={album.id} xs={12} sm={6} md={4}>
            <img className="albumImg" src={album.url} alt={album.title} />
          </Grid>
        ))}

          <Grid item xs={12} style={{ margin: 20, textAlign: "center" }} >
          {
            // Hide button when 50 Images
          limit < max &&
          <Button onClick={handleShowMoreImages} style={{ margin: 20 }} variant="contained">
            Load More
          </Button>
        }
          </Grid>

      </Grid>

    </div>
  );
};

export default Album;
