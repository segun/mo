export class Question {
  id: string;
  serial_number: string;
  question: string;
  answer: string;
  image_url: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  points: number;
}


export class QuestionSettings {
  id: string;
  name: string;
  value: string;
}