
import React from 'react';
import { Card, CardType } from './types';

export const CHILEAN_PHRASES = {
  WIN_POT: "¡Ganaste el pozo, sacaste los pasos prohibidos! 🕺",
  LOSE_ROUND: "Te quedaste sin lucas, eres el lacho de la ronda... 🫠",
  WAITING: "Esperando a los otros giles...",
  DEALER_TURN: "Eris el Dealer, elige con sabiduría (o pura mala leche).",
  NOT_ENOUGH_LUCAS: "No te quedan lucas para andar de jugoso.",
  ROUND_START: "¡Se armó la cosa! Tira tus mejores negras.",
  EXCHANGE_HAND: "Paga 1 Luca para cambiar tu mano penca.",
  DOUBLE_PLAY: "Paga 2 Lucas para tirar otra carta y asegurar."
};

export const MODO_AULA_DECK_WHITE: Card[] = [
  { id: 'w1', text: "Para fomentar el pensamiento crítico, los estudiantes propusieron: _______.", type: CardType.WHITE },
  { id: 'w2', text: "La planificación falló estrepitosamente cuando el profesor introdujo: _______.", type: CardType.WHITE },
  { id: 'w3', text: "Habilidad del Siglo XXI más difícil de evaluar en un recreo: _______.", type: CardType.WHITE },
  { id: 'w4', text: "El Decreto 67 dice explícitamente que no se puede reprobar por _______.", type: CardType.WHITE },
  { id: 'w5', text: "La gamificación perfecta incluye 3 cosas: Puntos, Insignias y _______.", type: CardType.WHITE },
  { id: 'w6', text: "En la reunión de apoderados, todos se pusieron de acuerdo en _______.", type: CardType.WHITE },
  { id: 'w7', text: "Mi portafolio docente fue calificado como 'Destacado' gracias a _______.", type: CardType.WHITE },
  { id: 'w8', text: "La IA en el aula reemplazará pronto a _______.", type: CardType.WHITE },
  { id: 'w9', text: "El PIE de mi colegio funciona principalmente a base de _______.", type: CardType.WHITE },
  { id: 'w10', text: "Aprendizaje Basado en Proyectos sobre: _______.", type: CardType.WHITE },
];

export const MODO_AULA_DECK_BLACK: Card[] = [
  { id: 'b1', text: "ChatGPT escribiendo el ensayo de lenguaje.", type: CardType.BLACK },
  { id: 'b2', text: "Gamificación basada exclusivamente en memes de Condorito.", type: CardType.BLACK },
  { id: 'b3', text: "Un debate socrático sobre por qué no hay confort en el baño.", type: CardType.BLACK },
  { id: 'b4', text: "Colaboración radical entre el inspector y el centro de alumnos.", type: CardType.BLACK },
  { id: 'b5', text: "Design Thinking aplicado a la fila del casino.", type: CardType.BLACK },
  { id: 'b6', text: "Pensamiento computacional usando porotos.", type: CardType.BLACK },
  { id: 'b7', text: "Alfabetización digital para la tía del aseo.", type: CardType.BLACK },
  { id: 'b8', text: "Evaluación formativa mediante duelos de rimas.", type: CardType.BLACK },
  { id: 'b9', text: "Aprendizaje socioemocional después de un 2.0 en matemáticas.", type: CardType.BLACK },
  { id: 'b10', text: "Un TikTok educativo de 15 segundos sobre la célula.", type: CardType.BLACK },
  { id: 'b11', text: "El currículum nacional convertido en un juego de rol.", type: CardType.BLACK },
  { id: 'b12', text: "Resolución de conflictos mediante un 'Piedra, Papel o Tijera'.", type: CardType.BLACK },
  { id: 'b13', text: "Flipped Classroom pero nadie vio el video.", type: CardType.BLACK },
  { id: 'b14', text: "Metacognición sobre por qué me dio sueño en clase.", type: CardType.BLACK },
  { id: 'b15', text: "Realidad Aumentada para ver los gérmenes del teclado.", type: CardType.BLACK },
  { id: 'b16', text: "Liderazgo distribuido en el grupo de WhatsApp del curso.", type: CardType.BLACK },
  { id: 'b17', text: "Inclusión educativa usando lenguaje de señas para pedir permiso.", type: CardType.BLACK },
  { id: 'b18', text: "Ciudadanía digital responsable (no doxxear al profe).", type: CardType.BLACK },
  { id: 'b19', text: "Mentalidad de crecimiento aplicada a la colación.", type: CardType.BLACK },
  { id: 'b20', text: "Creatividad extrema para justificar la inasistencia.", type: CardType.BLACK },
];
