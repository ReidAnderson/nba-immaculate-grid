'use client'

import { Autocomplete, Box, Button, TextField, ThemeProvider, createTheme } from '@mui/material';
import Image from 'next/image'
import { useState } from 'react';
import playerData from './players.json';

interface SquareProps {
  index: number;
  value: string;
  isSelected: boolean;
  handleClick(index: number): void;
}

interface ComboBoxProps {
  onChange(event: any, value: any): void;
}

const puzzle: { [key: string]: string[] } = {
  number: ['0'],
  row_labels: ['Knicks', 'Twolves', 'NBA 1st Tm'],
  col_labels: ['76ers', 'Kings', '25k pts']
}

const answer: { [key: number | string]: number[] } = {
  0: [691, 703, 782, 792, 876, 882, 1094, 1212, 1308, 1424, 1452, 1822, 1864, 1906, 2098, 2172, 2209, 2226, 2298, 2333, 2402, 2414, 2465, 2510, 2648, 2707, 2880, 3074, 3093, 3132, 3143, 3268, 3349, 3470, 3688, 3715, 3759, 3793, 3810, 3982, 4063, 4102, 4110, 4214, 4278, 4384, 4389, 4721, 4776],
  1: [1928, 1954, 1965, 2122, 2269, 2347, 2566, 2712, 3081, 3126, 3140, 3205, 3247, 3349, 3363, 3448, 3470, 3506, 3563, 3715, 3718, 3737, 3785, 3908, 3923, 3982, 4001, 4011, 4022, 4102, 4115, 4126, 4272, 4324, 4456, 4776],
  2: [752, 3435],
  3: [2226, 2327, 2402, 2411, 2465, 2685, 2853, 2932, 2944, 2959, 3076, 3171, 3175, 3188, 3270, 3514, 3688, 3710, 3745, 3791, 3798, 3826, 3833, 3942, 4023, 4040, 4063, 4170, 4172, 4179, 4197, 4246, 4390, 4529],
  4: [2143, 2270, 2274, 2347, 2699, 2740, 2847, 3041, 3076, 3106, 3171, 3175, 3261, 3336, 3537, 3632, 3714, 3718, 3731, 3745, 3785, 3798, 3799, 3831, 3833, 3881, 3896, 3923, 4001, 4246, 4351, 4702],
  5: [2936],
  6: [699, 842, 1362, 1381, 1605, 2162, 2967],
  7: [2781],
  8: [2058, 1381, 1204, 3770, 2252, 2967, 3463, 713, 3092, 856, 2936, 2193, 1605, 1101, 1447, 2751, 699, 710, 3880, 2176, 3849, 778, 3000, 3116]
}

const Square = (props: SquareProps) => {
  const { index, isSelected, value, handleClick } = props;

  let backgroundColor = '#fff';
  if (isSelected) {
    backgroundColor = '#ffd';
  } else if (value) {
    backgroundColor = '#0F0';
  }

  const styles = {
    button: {
      width: "100px",
      height: "100px",
      backgroundColor: backgroundColor,
      '&:hover': {
        backgroundColor: '#000',
        //opacity: [0.9, 0.8, 0.7],
      },
      border: '1px solid #000',
    }
  };
  return (
    <Box style={styles.button} onClick={() => handleClick(index)}>
      {value}
    </Box>
  );
};

function ComboBox(props: ComboBoxProps) {
  const handleFilterOptions = (options: any, state: any) => {
    if (state.inputValue === '') {
      return [];
    }

    return options.filter((option: any) =>
      option.label.toLowerCase().includes(state.inputValue.toLowerCase())
    );
  };

  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={playerData}
      sx={{ width: 300 }}
      filterOptions={handleFilterOptions}
      onChange={props.onChange}
      noOptionsText="Search"
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props} key={option.playerId}>
          {option.label} ({option.startYear}-{option.endYear})
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label="Player Search" />}
    />
  );
}



export default function Home() {
  const [lastGuess, setLastGuess] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [guessesRemaining, setGuessesRemaining] = useState<number>(9);
  const [correctIndices, setCorrectIndices] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const handleClick = (index: number) => {
    if (guessesRemaining > 0) {
      setSelected(index);
    }
  };
  const handleChange = (event: any, value: any) => {
    if (selected == null) { return; }
    // Do something with the selected value
    setGuessesRemaining(guessesRemaining - 1);
    if (answer[selected].includes(Number(value.playerId))) {
      setCorrectIndices(correctIndices.map((v, i) => i == selected ? value.playerId : v));
      setLastGuess(`${value.label} (Correct)`)
      setSelected(null);
    } else {
      setSelected(null);
      setLastGuess(`${value.label} (Incorrect)`)
    }
  };
  const getCorrectResult = (idx: number) => {
    return correctIndices[idx] != 0 ? "🟩" : "⬜️";
  }
  const handleCopyResults = () => {
    const countCorrect = correctIndices.filter(v => v != 0).length;
    const text = `NBA "Immaculate" Grid ${puzzle.number[0]} ${countCorrect}/9:\n\n${getCorrectResult(0)}${getCorrectResult(1)}${getCorrectResult(2)}\n${getCorrectResult(3)}${getCorrectResult(4)}${getCorrectResult(5)}\n${getCorrectResult(6)}${getCorrectResult(7)}${getCorrectResult(8)}`;
    navigator.clipboard.writeText(text);
  }
  return (
    <main className="flex flex-col items-center justify-between p-24">
      {selected !== null && correctIndices[selected] == 0 && (
        <ComboBox onChange={handleChange} />
      )}
      <div className="grid grid-cols-4">
        <div></div>
        <div className="col-label" style={{textAlign: 'center'}}>{puzzle.col_labels[0]}</div>
        <div className="col-label" style={{textAlign: 'center'}}>{puzzle.col_labels[1]}</div>
        <div className="col-label" style={{textAlign: 'center'}}>{puzzle.col_labels[2]}</div>
        <div className="row-label" style={{textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>{puzzle.row_labels[0]}</div>
        {[0, 1, 2].map((index) => (
          <Square key={index} index={index} isSelected={selected == index} value={correctIndices[index] != 0 ? playerData.find(p => Number(p.playerId) == correctIndices[index])!.label : ''} handleClick={handleClick} />
        ))}
        <div className="row-label" style={{textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>{puzzle.row_labels[1]}</div>
        {[3, 4, 5].map((index) => (
          <Square key={index} index={index} isSelected={selected == index} value={correctIndices[index] != 0 ? playerData.find(p => Number(p.playerId) == correctIndices[index])!.label : ''} handleClick={handleClick} />
        ))}
        <div className="row-label" style={{textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>{puzzle.row_labels[2]}</div>
        {[6, 7, 8].map((index) => (
          <Square key={index} index={index} isSelected={selected == index} value={correctIndices[index] != 0 ? playerData.find(p => Number(p.playerId) == correctIndices[index])!.label : ''} handleClick={handleClick} />
        ))}
        <div></div>
      </div>
      {lastGuess && <div>Previous Guess: {lastGuess}</div>}
      <div>Guesses : {guessesRemaining}</div>
      {guessesRemaining == 0 && <Button variant="contained" onClick={handleCopyResults}>Copy Results</Button>}
    </main>
  )
}