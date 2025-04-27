// src/twitch/dragon.entity.ts
export class Dragon {
    constructor(
      public name: string,
      public stage: string,
      public traits: { personality: string; ability: string },
      public eggType: string,
      public rarity: string,
    ) {}
  
    static generateName(): string {
      const prefixes = ['Aurora', 'Vortex', 'Ignis', 'Zephyr', 'Lunar', 'Solaris'];
      const suffixes = ['Gore', 'Raxton', 'Thalass', 'Vyrn', 'Norelia', 'Zyphra'];
      const number = Math.floor(Math.random() * 1000);
      return `${this.randomElement(prefixes)}${this.randomElement(suffixes)}${number}`;
    }
  
    static generateTraits(): { personality: string; ability: string } {
      const personalities = ['Valiente', 'Juguetón', 'Sabio', 'Travieso', 'Noble'];
      const abilities = ['Volar alto', 'Escupir fuego', 'Controlar el clima', 'Respirar bajo el agua'];
      return {
        personality: this.randomElement(personalities),
        ability: this.randomElement(abilities),
      };
    }
  
    static generateEggDetails(): { eggType: string; rarity: string } {
      const eggTypes = ['Mágico', 'Fuego', 'Espectral', 'Agua', 'Tierra'];
      const rarities = [
        { name: 'Común', probability: 0.75 },
        { name: 'Raro', probability: 0.15 },
        { name: 'Épico', probability: 0.06 },
        { name: 'Legendario', probability: 0.03 },
        { name: 'Mítico', probability: 0.009 },
        { name: 'Celestial', probability: 0.001 },
      ];
  
      let accumulatedProbability = 0;
      return {
        eggType: this.randomElement(eggTypes),
        rarity: rarities.find(r => {
          accumulatedProbability += r.probability;
          return Math.random() < accumulatedProbability;
        })?.name || 'Común',
      };
    }
  
    private static randomElement(array: any[]): any {
      return array[Math.floor(Math.random() * array.length)];
    }
  }