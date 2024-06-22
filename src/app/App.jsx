import "firebase/database";

import React, { useEffect, useCallback, useContext } from "react";
import { initializeApp } from "firebase/app";

import { makeBetURL, parseBetUrl } from "./util";
import HomePage from "./HomePage";
import { RoundContext } from "./RoundState";
import useRoundData from "./useRoundData";

const config = {
  apiKey: "AIzaSyA1AJzRRbOTh7iVZi4DfK9lBuSJnfTTbr4",
  authDomain: "neofoodclub.firebaseapp.com",
  databaseURL: "https://neofoodclub-default-rtdb.firebaseio.com",
  projectId: "neofoodclub",
  storageBucket: "neofoodclub.appspot.com",
  messagingSenderId: "1085231429788",
  appId: "1:1085231429788:web:6a5ce4dbe8a5021e64d559",
  measurementId: "G-TPEBSBBBTR",
};

const firebase = initializeApp(config);

function App() {
  const { roundState, setRoundState } = useContext(RoundContext);

  useRoundStateURLs();

  const [currentRound, roundData] = useRoundData(
    firebase,
    roundState.currentSelectedRound
  );

  // If we don't have a selected round yet, initialize it to the current round ID, once it loads in.
  useEffect(() => {
    let data = { currentRound: parseInt(currentRound) };
    if (roundState.currentSelectedRound === null && currentRound) {
      data = { ...data, currentSelectedRound: parseInt(currentRound) };
    }

    setRoundState(data);
  }, [roundState.currentSelectedRound, currentRound, setRoundState]);

  useEffect(() => {
    if (currentRound && roundData) {
      setRoundState({
        roundData: roundData,
        currentRound: currentRound,
      });
    }
  }, [currentRound, roundData, setRoundState]);

  return <HomePage />;
}

function useRoundStateURLs() {
  const {
    roundState,
    setRoundState,
    currentBet,
    allBetAmounts,
    allBets,
    setAllBetAmounts,
    setAllBets,
  } = useContext(RoundContext);

  useEffect(() => {
    if (roundState.currentSelectedRound === null) {
      return;
    }

    const url = makeBetURL(
      roundState.currentSelectedRound,
      allBets[currentBet],
      allBetAmounts[currentBet],
      true
    );

    window.history.replaceState(null, "", url);
  }, [roundState, currentBet, allBets, allBetAmounts]);

  const onHashChange = useCallback(() => {
    const data = parseBetUrl(window.location.hash.slice(1));
    if (isNaN(parseInt(data.round))) {
      data.round = roundState.currentRound.toString();
    }

    const isSameRound =
      parseInt(data.round) === parseInt(roundState.currentSelectedRound);

    setRoundState({
      currentSelectedRound: data.round,
      customOdds: isSameRound ? roundState.customOdds : null,
      customProbs: isSameRound ? roundState.customProbs : null,
      viewMode: false,
      roundData: isSameRound ? roundState.roundData : null,
    });

    if (data.bets !== allBets[currentBet]) {
      setAllBets({ ...allBets, [currentBet]: data.bets });
    }
    if (data.betAmounts !== allBetAmounts[currentBet]) {
      setAllBetAmounts({ ...allBetAmounts, [currentBet]: data.betAmounts });
    }
  }, [
    roundState.currentRound,
    roundState.currentSelectedRound,
    roundState.roundData,
    roundState.customOdds,
    roundState.customProbs,
    setRoundState,
    allBets,
    allBetAmounts,
    setAllBets,
    setAllBetAmounts,
    currentBet,
  ]);

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [onHashChange]);
}

export default App;
