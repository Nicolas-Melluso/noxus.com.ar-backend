// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('twitch')
export class TwitchController {
  constructor() {}

  @Post()
  create(@Body() command: any, @Res() res: Response) {
    console.log("Ingresé", command);

    // Extraer el nombre de usuario del evento
    const username = command?.event?.user?.username || 'UsuarioDesconocido';

    // Simular el cálculo del tiempo acumulado
    const watchTime = Math.floor(Math.random() * 5000); // Tiempo aleatorio entre 0 y 5000 segundos

    // Asignar un rol basado en el tiempo acumulado
    let role = 'Lurker 🐌';
    if (watchTime >= 60 && watchTime < 300) role = 'Espectador Novato 👀';
    else if (watchTime >= 300 && watchTime < 900) role = 'Curioso Aprendiz 🧑‍🎓';
    else if (watchTime >= 900 && watchTime < 1800) role = 'Explorador Fiel 🧭';
    else if (watchTime >= 1800 && watchTime < 3600) role = 'Guardián del Chat 🛡️';
    else if (watchTime >= 3600) role = 'Dragón Supremo 🌟👑';

    // Construir la respuesta en formato text/plain
    const responseText = `Tu rol es: ${role} (${watchTime} segundos)`;

    // Enviar la respuesta al cliente
    res.type('text/plain');
    res.send(responseText);
  }
}