'use client'

import { Autocomplete, Box, Button, TextField, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import playerData from './players.json';
import puzzles from './puzzles.json';

interface Puzzle {
  number: number;
  rowLabels: string[];
  columnLabels: string[];
}

interface PuzzleDefinition {
  puzzle: Puzzle;
  answers: { [key: string]: number[] };
}

interface SquareProps {
  index: number;
  value: string;
  isSelected: boolean;
  handleClick(index: number): void;
}

interface ComboBoxProps {
  onChange(event: any, value: any): void;
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

const toISOStringWithTimezone = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? '+' : '-';
  const pad = n => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    diff + pad(tzOffset / 60) +
    ':' + pad(tzOffset % 60);
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
  const currentDate = toISOStringWithTimezone(new Date()).slice(0, 10);
  const typedPuzzle: {[key: string] : PuzzleDefinition} = puzzles;
  const puzzleDefinition = typedPuzzle[currentDate];
  const puzzle = puzzleDefinition.puzzle;
  const answer = puzzleDefinition.answers;

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
    const text = `NBA "Immaculate" Grid ${puzzle.number} ${countCorrect}/9:\n\n${getCorrectResult(0)}${getCorrectResult(1)}${getCorrectResult(2)}\n${getCorrectResult(3)}${getCorrectResult(4)}${getCorrectResult(5)}\n${getCorrectResult(6)}${getCorrectResult(7)}${getCorrectResult(8)}`;
    navigator.clipboard.writeText(text);
  }
  return (
    <main className="flex flex-col items-center justify-between p-24">
      {selected !== null && correctIndices[selected] == 0 && (
        <ComboBox onChange={handleChange} />
      )}
      <div className="grid grid-cols-4">
        <div></div>
        <div className="col-label" style={{ maxWidth: 100, textAlign: 'center' }}>{puzzle.columnLabels[0]}</div>
        <div className="col-label" style={{ maxWidth: 100, textAlign: 'center' }}>{puzzle.columnLabels[1]}</div>
        <div className="col-label" style={{ maxWidth: 100, textAlign: 'center' }}>{puzzle.columnLabels[2]}</div>
        <div className="row-label" style={{ maxWidth: 100, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{puzzle.rowLabels[0]}</div>
        {[0, 1, 2].map((index) => (
          <Square key={index} index={index} isSelected={selected == index} value={correctIndices[index] != 0 ? playerData.find(p => Number(p.playerId) == correctIndices[index])!.label : ''} handleClick={handleClick} />
        ))}
        <div className="row-label" style={{ maxWidth: 100, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{puzzle.rowLabels[1]}</div>
        {[3, 4, 5].map((index) => (
          <Square key={index} index={index} isSelected={selected == index} value={correctIndices[index] != 0 ? playerData.find(p => Number(p.playerId) == correctIndices[index])!.label : ''} handleClick={handleClick} />
        ))}
        <div className="row-label" style={{ maxWidth: 100, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{puzzle.rowLabels[2]}</div>
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