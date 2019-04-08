import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PaperWrapper from './PaperWrapper';

const style = theme => ({
  root: {
    flexGrow: 1,

  },
  button: {
    margin: theme.spacing.unit,
  },
});

const Main = (props) => {
  const { classes, startHandle } = props;
  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0}
        justify="center"
        alignItems="center"
      >
        <Grid item xs={4}>
          <PaperWrapper
            title="Start the Quizz"
          >
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={startHandle}
            >
          Start
            </Button>
          </PaperWrapper>
        </Grid>
      </Grid>
    </div>
  );
};

Main.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
  }).isRequired,
  startHandle: PropTypes.func.isRequired,
};

export default withStyles(style)(Main);
