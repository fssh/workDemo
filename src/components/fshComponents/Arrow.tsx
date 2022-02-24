import React from 'react';
import PropTypes from 'prop-types';
import styles from './Arrow.less';

const Arrow = props => {
  const { direction = 'right', onClick } = props;
  return (
    <div
      className={styles.arrowContainer + ' arrowContainer ' + `${direction}`}
      onClick={onClick}
    >
      <div className="poly"></div>
    </div>
  );
};

Arrow.propTypes = {};

export default Arrow;
