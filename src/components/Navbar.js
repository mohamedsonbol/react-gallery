import React from 'react'
import { AppBar, Toolbar, Typography} from '@material-ui/core';

const NavBar = () => {
    return (
        <AppBar>
            <Toolbar>
                <Typography variant="h6">
                    Image Gallery App
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;