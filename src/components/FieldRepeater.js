import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class FieldRepeater extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    inputType: PropTypes.oneOf(['text', 'number']),
    pluralTitle: PropTypes.string,
    singluarTitle: PropTypes.string,
    onAddItem: PropTypes.func,
    onRemoveItem: PropTypes.func,
    shape: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(['text', 'number']).isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  };

  static defaultProps = {
    inputType: 'text',
    data: [],
    pluralTitle: 'Values',
    singluarTitle: 'Value',
    onAddItem: null,
    onRemoveItem: null,
    shape: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.shape ? [] : '',
    };
  }

  handleChange = e => {
    const { shape } = this.props;
    const { name, value } = e.target;

    if (shape) {
      const shapeIndex = shape.findIndex(element => element.name === name);
      const newValue = this.state.value;
      newValue[shapeIndex] = value;
      console.log(shapeIndex);
      this.setState({
        value: newValue,
      });
    } else {
      this.setState({
        value,
      });
    }
    console.log(e.target.name);
  };

  handleAddItem = e => {
    e.preventDefault();
    const { onAddItem, shape } = this.props;
    const { value } = this.state;
    if (typeof onAddItem === 'function') {
      if (shape) {
        const newValue = {};
        shape.forEach((shapeMap, index) => {
          newValue[shapeMap.name] = value[index];
        });
        onAddItem(newValue);
        this.setState({
          value: [],
        });
      } else {
        onAddItem(value);
      }

      this.setState({
        value: '',
      });
    }
  };

  handleRemoveItem = (value, e) => {
    e.preventDefault();
    const { onRemoveItem } = this.props;

    if (typeof onRemoveItem === 'function') {
      onRemoveItem(value);
    }
  };

  render() {
    const { handleChange } = this;
    const { value } = this.state;
    const { data, singluarTitle, inputType, shape } = this.props;

    const dataRows = data.map(row => {
      if (shape) {
        return (
          <tr key={row.join('-')}>
            {row.map((columnValue, index) => (
              <td key={`${shape[index].name}-${columnValue}`}>{columnValue}</td>
            ))}
            <td>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={e => this.handleRemoveItem(row, e)}
              >
                X
              </button>
            </td>
          </tr>
        );
      }

      return (
        <tr key={row}>
          <td>{row}</td>
          <td>
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={e => this.handleRemoveItem(row, e)}
            >
              X
            </button>
          </td>
        </tr>
      );
    });

    const controls = shape ? (
      <tr className="field-controls">
        {shape.map((input, index) => (
          <td key={input.name}>
            <input
              type={input.type}
              value={value[index]}
              name={input.name}
              onChange={handleChange}
            />
          </td>
        ))}
        <td>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.handleAddItem}
            disabled={value.length < 1}
          >
            Add {singluarTitle}
          </button>
        </td>
      </tr>
    ) : (
      <tr className="field-controls">
        <td>
          <input type={inputType} value={value} onChange={handleChange} />
        </td>
        <td>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.handleAddItem}
            disabled={value.length < 1}
          >
            Add {singluarTitle}
          </button>
        </td>
      </tr>
    );

    return (
      <div className="field-repeater">
        <table className="table field-data">
          {shape && (
            <thead data-testid="field-head">
              <tr>
                {shape.map(heading => (
                  <th key={heading.name}>{heading.name}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody data-testid="field-data">{dataRows}</tbody>
          <tfoot data-testid="field-controls">{controls}</tfoot>
        </table>
      </div>
    );
  }
}
