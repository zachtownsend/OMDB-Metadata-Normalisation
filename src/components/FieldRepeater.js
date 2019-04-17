import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Shape, { string, number, oneOfType } from 'matches-shape';

const arrayOfValues = new Shape([oneOfType([string, number])]);

export default class FieldRepeater extends Component {
  state = {
    value: '',
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    inputType: PropTypes.oneOf(['text', 'number']),
    pluralTitle: PropTypes.string,
    singluarTitle: PropTypes.string,
    onAddRow: PropTypes.func,
  };

  static defaultProps = {
    inputType: 'text',
    data: [],
    pluralTitle: 'Values',
    singluarTitle: 'Value',
    onAddRow: null,
  };

  handleChange = e => {
    const { value } = e.target;
    this.setState({
      value,
    });
  };

  handleAddRow = e => {
    e.preventDefault();
    const { onAddRow } = this.props;
    const { value } = this.state;
    if (typeof onAddRow === 'function') {
      onAddRow(value);
    }

    this.setState({
      value: '',
    });
  };

  render() {
    const { handleChange } = this;
    const { value } = this.state;
    const { name, data, singluarTitle, inputType } = this.props;
    const simpleData = arrayOfValues.matches(data);

    const dataValues = Array.isArray(data)
      ? data.map((value, index) => {
          if (simpleData) {
            return (
              <tr key={value}>
                <td>
                  {value}
                  <input
                    type="hidden"
                    name={`${name}[${index}]`}
                    value={value}
                  />
                </td>
              </tr>
            );
          }

          return null;
        })
      : null;

    const controls = simpleData ? (
      <tr className="field-controls">
        <td>
          <input type={inputType} value={value} onChange={handleChange} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.handleAddRow}
            disabled={value.length < 1}
          >
            Add {singluarTitle}
          </button>
        </td>
      </tr>
    ) : null;

    return (
      <div className="field-repeater">
        <table className="table field-data">
          <tbody data-testid="field-data">{dataValues}</tbody>
          <tfoot data-testid="field-controls">{controls}</tfoot>
        </table>
      </div>
    );
  }
}
