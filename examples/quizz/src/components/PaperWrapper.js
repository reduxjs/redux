import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    textAlign: 'center',
  },
});

function PaperWrapper(props) {
  const {
    classes,
    children,
    description,
    title,
  } = props;

  return (
    <div>
      <Paper className={classes.root} elevation={1}>
        <Typography variant="h5" component="h5">
          {title}
        </Typography>
        <Typography component="h3">
          {description}
        </Typography>
        {children}
      </Paper>
    </div>
  );
}

PaperWrapper.defaultProps = {
  description: '',
};

PaperWrapper.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default withStyles(styles)(PaperWrapper);
