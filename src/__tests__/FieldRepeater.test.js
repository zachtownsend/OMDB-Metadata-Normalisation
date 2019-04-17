import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import FieldRepeater from '../components/FieldRepeater';

afterEach(cleanup);

describe('Field Repeater given array of strings', () => {
  // Show added data
  //

  it('shows data added as props before the controls', () => {
    const dummyData = ['John Wayne', 'Paul Rudd'];
    const { getByTestId, debug } = render(
      <FieldRepeater
        name="actors"
        data={dummyData}
        pluralTitle="Actors"
        singularTitle="Actor"
      />
    );

    const fieldData = getByTestId('field-data');
    const tds = fieldData.querySelectorAll('td');

    expect(tds.length).toBe(dummyData.length * 2);
    expect(tds[0].textContent).toMatch('John Wayne');
    expect(tds[2].textContent).toMatch('Paul Rudd');
  });

  it('displays form to add new values', () => {
    const dummyData = ['John Wayne', 'Paul Rudd'];
    const { getByTestId } = render(
      <FieldRepeater
        name="actors"
        data={dummyData}
        pluralTitle="Actors"
        singluarTitle="Actor"
      />
    );

    const fieldControls = getByTestId('field-controls');
    const button = fieldControls.querySelector('button.btn');
    const input = fieldControls.querySelector('input');

    expect(input.type).toBe('text');
    expect(button.textContent).toBe('Add Actor');
  });

  it('calls a prop function with the entered data as the argument', () => {
    const dummyData = [];

    const onAddItem = data => {
      expect(data).toBe('Robert Deniro');
      dummyData.push(data);
    };

    const { getByTestId } = render(
      <FieldRepeater
        name="actors"
        data={dummyData}
        pluralTitle="Actors"
        singluarTitle="Actor"
        onAddItem={onAddItem}
      />
    );

    const fieldControls = getByTestId('field-controls');
    const button = fieldControls.querySelector('button.btn');
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

describe('Field repeater receives multidimensional data', () => {
  it('displays the table header if a shape is defined', () => {
    const { getByTestId } = render(
      <FieldRepeater
        name="ratings"
        data={[
          ['Internet Movie Database', '7.7/10'],
          ['Rotten Tomatoes', '83%'],
          ['Metacritic', '67/100'],
        ]}
        shape={[
          {
            type: 'text',
            name: 'Source',
          },
          {
            type: 'text',
            name: 'Value',
          },
        ]}
        pluralTitle="Actors"
        singularTitle="Actor"
      />
    );

    const head = getByTestId('field-head');
    const ths = head.querySelectorAll('th');

    expect(head).toBeDefined();
    expect(ths.length).toBe(2);
    expect(ths[0].textContent).toMatch('Source');
    expect(ths[1].textContent).toMatch('Value');
  });

  it('displays the currently added multidimensional data', () => {
    const shape = [
      {
        type: 'text',
        name: 'Source',
      },
      {
        type: 'text',
        name: 'Value',
      },
    ];

    const dummyData = [
      ['Internet Movie Database', '7.7/10'],
      ['Rotten Tomatoes', '83%'],
      ['Metacritic', '67/100'],
    ];

    const { getByTestId } = render(
      <FieldRepeater
        name="ratings"
        data={dummyData}
        shape={shape}
        pluralTitle="Actors"
        singularTitle="Actor"
      />
    );

    const body = getByTestId('field-data');
    const trs = body.querySelectorAll('tr');

    expect(trs.length).toBe(3);
    trs.forEach((tr, index) => {
      expect(tr.firstChild.textContent).toMatch(dummyData[index][0]);
      expect(tr.querySelectorAll('td')[1].textContent).toMatch(
        dummyData[index][1]
      );
    });
  });
});
