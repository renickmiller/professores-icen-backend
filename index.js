const pup = require('puppeteer');
const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors());
const router = express.Router();
app.use(express.json());
const PORT = process.env.PORT || 8080;

//Populando o banco de dados

//Criando a conexão
// const connection = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'renick123456',
//   database: 'googleacademico',
// });

const connection = mysql.createPool({
  host: 'us-cdbr-east-05.cleardb.net',
  user: 'bea21cfed3018e',
  password: '8a173ef0',
  database: 'heroku_82fb86e0357b1ea',
});

//mysql://bea21cfed3018e:8a173ef0@us-cdbr-east-05.cleardb.net/heroku_82fb86e0357b1ea?reconnect=true
//heroku

//Função que executa os métodos no bd

function execSQLQuery(sqlQry) {
  connection.query(sqlQry, function (error, results, fields) {
    if (error) {
      console.log(error);
    } else console.log(results);
    console.log('executou!');
  });
}

function execSQLQuerytwo(sqlQry, res) {
  connection.query(sqlQry, function (error, results, fields) {
    if (error) res.json(error);
    else res.json(results);
    console.log('executou!');
  });
}

//Inicia o Servidor
app.listen(PORT, () => {
  console.log('porta: ', PORT);
});

//Definindo rotas necessárias
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

router.get('/professores', (req, res) => {
  execSQLQuerytwo('SELECT * FROM professores', res);
});

function post(infos, i) {
  execSQLQuery(
    `UPDATE professores SET nome='${infos.title}', citacoes='${
      infos.values[0]
    }', citacoes_2017='${infos.values[1]}', ih='${infos.values[2]}', ih_2017='${
      infos.values[3]
    }', i10='${infos.values[4]}', i10_2017='${infos.values[5]}', imglink = '${
      infos.img[0].src
    }
    }' WHERE idprofessores=${i + 1}`,
  );
}

//Links dos professores
var professor = [
  'https://scholar.google.com.br/citations?user=cAcwnEIAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=y8yPRGQAAAAJ&hl=pt-BR',
  'https://scholar.google.com.br/citations?user=YM9xFA8AAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=5bBpnU4AAAAJ&hl=pt-BR',
  'https://scholar.google.com.br/citations?user=27KAl8UAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?hl=en&user=w2HVcs4AAAAJ',
  'https://scholar.google.com.br/citations?user=5kncGscAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=ff_HBhQAAAAJ&hl=pt-BR',
  'https://scholar.google.com.br/citations?user=6Oexn7IAAAAJ&hl=pt-BR&oi=sra',
  'https://scholar.google.com.br/citations?user=u85_xdkAAAAJ&hl=pt-BR&oi=sra',
  'https://scholar.google.com.br/citations?user=LgIN_csAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=dOeggYMAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=cbiG6DgAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=H6N8NT8AAAAJ&hl=pt-BR',
  'https://scholar.google.com.br/citations?user=_OYbuWUAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?hl=pt-BR&user=H0BknjUAAAAJ',
  'https://scholar.google.com.br/citations?hl=pt-BR&user=jHPSIzwAAAAJ',
  'https://scholar.google.com.br/citations?user=hA6LXfUAAAAJ&hl=pt-BR',
  'https://scholar.google.com.br/citations?user=btqFQ84AAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=GR6HUOkAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?user=23A9ARwAAAAJ&hl=pt-BR&oi=ao',
  'https://scholar.google.com.br/citations?hl=pt-BR&user=SGplhDUAAAAJ',
  'https://scholar.google.com.br/citations?hl=pt-BR&user=EKScjsUAAAAJ',
];

//Web Scraping dos dados
(async () => {
  const browser = await pup.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }); //false abre o navegador e mostra o processo
  const page = await browser.newPage(); //Cria página
  console.log('INICIEI!');

  //array para varrer todos os links
  for (i = 0; i < professor.length; i++) {
    await page.goto(professor[i]); //Navega por todas as páginas
    console.log('Fui pra URL!');
    const infos = await page.evaluate(() => {
      let value = [];
      let img = [];
      for (
        let i = 0;
        i < document.querySelectorAll('.gsc_rsb_std').length;
        i++
      ) {
        value[i] = document.querySelectorAll('.gsc_rsb_std')[i].innerText;
      }
      const nodeList = document.querySelectorAll('#gsc_prf_pup-img');
      const imgArray = [...nodeList];
      let list = imgArray.map(({ src }) => ({ src }));
      return {
        title: document.title,
        values: value,
        img: list,
      };
    });
    console.log(infos);
    post(infos, i);
  }
  await page.waitForTimeout(3000);
  await browser.close();
})();
