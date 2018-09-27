serverless-cli
===============

serverless-cli é uma *bitcode* extensão do cli do [thrust](https://github.com/thrustjs/thrust)

**WIP**: Este bitcode está em estado de work in progress, juntamente com o playground de aplicações serverless em thrust, não use em produção.

# Instalação

Posicionado em um app [thrust](https://github.com/thrustjs/thrust), no seu terminal:

```bash
thrust install serverless-cli
```

Em seguida, adicione o mesmo como um `cli-extension` ao `brief.json` de sua aplicação,
para que o mesmo seja carregado junto com o `thrust`.

```json
{
  ...
  "cli-extensions": [
    "serverless-cli"
  ],
  ...
}
```

Configure seu config.json e suas variáveis de ambiente com as variáveis de deploy,
exemplo:

```json
{
    "serverless-cli": {
        "environments": {
            "dev": {
                "secret": "shhhThisIsTheSecret",
                "host": "http://localhost:8778"
            },
            "hml": {
                "host": "serverless-hml.softbox.com.br"
            },
            "prod": {
                "host": "serverless.softbox.com.br"
            }
        }
    }
}
```

## Tutorial

Agora, basta utilizar o comando de deploy para realizar o deploy de sua aplicação

```bash
thrust deploy #deploy em dev por padrão
thrust deploy hml #usando a configuração hml
thrust deploy prod #usando a configuração prod
```