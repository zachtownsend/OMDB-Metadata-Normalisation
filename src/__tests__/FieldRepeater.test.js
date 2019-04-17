import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import FieldRepeater from '../components/FieldRepeater';

afterEach(cleanup);

describe('Field Repeater given array of strings', () => {
  // Show added data
  //

  it('shows data added as props before the controls', () => {
    const { getByTestId } = render(
      <FieldRepeater
        name="actors"
        data={['John Wayne', 'Paul Rudd']}
        pluralTitle="Actors"
        singularTitle="Actor"
      />
    );

    const fieldData = getByTestId('field-data');
    const inputs = fieldData.querySelectorAll('input');
    const tds = fieldData.querySelectorAll('td');
    // console.log(inputs);

    expect(inputs.length).toBe(2);
    expect(tds.length).toBe(2);
    expect(inputs[0].name).toBe('actors[0]');
    expect(inputs[1].name).toBe('actors[1]');
    expect(inputs[0].value).toBe('John Wayne');
    expect(inputs[1].value).toBe('Paul Rudd');
    expect(tds[0].textContent).toBe('John Wayne');
    expect(tds[1].textContent).toBe('Paul Rudd');
  });

  it('displays form to add new values', () => {
    const { getByTestId } = render(
      <FieldRepeater
        name="actors"
        data={['John Wayne', 'Paul Rudd']}
        pluralTitle="Actors"
        singluarTitle="Actor"
      />
    );

    const fieldControls = getByTestId('field-controls');
    const button = fieldControls.querySelector('button.add-value');
    const input = fieldControls.querySelector('input');

    expect(input.type).toBe('text');
    expect(button.textContent).toBe('Add Actor');
  });

  it('calls a prop function with the entered data as the argument', () => {
    const dummyData = [];

    const onAddRow = data => {
      expect(data).toBe('Robert Deniro');
      dummyData.push(data);
    };

    const { getByTestId } = render(
      <FieldRepeater
        name="actors"
        data={dummyData}
        pluralTitle="Actors"
        singluarTitle="Actor"
        onAddRow={onAddRow}
      />
    );

    const fieldControls = getByTestId('field-controls');
    const button = fieldControls.querySelector('button.add-value');
    const input = fieldControls.querySelector('input');

    fireEvent.change(input, {
      target: {
        value: 'Robert Deniro',
      },
    });
    fireEvent.click(button);
    expect(input.value).toBe('');
    expect(dummyData).toEqual(['Robert Deniro']);
  });
});
