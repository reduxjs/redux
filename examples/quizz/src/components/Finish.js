import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PaperWrapper from './PaperWrapper';

const style = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

const Main = (props) => {
  const {
    classes,
    handleClick,
    score,
  } = props;

  return (
    <div>
      <Grid
        container
        spacing={0}
        justify="center"
        alignItems="center"
      >
        <Grid item xs={4}>
          <PaperWrapper
            title="Result"
            description={`You have ${score} points.`}
          >
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={handleClick}
            >
          Restart
            </Button>
          </PaperWrapper>
        </Grid>
      </Grid>
    </div>
  );
};

Main.propTypes = {
  classes: PropTypes.shape({
    button: PropTypes.string.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired,
};

export default withStyles(style)(Main);
