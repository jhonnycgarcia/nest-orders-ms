<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Comando para levantar base de datos
```
docker compose -f docker-compose.yaml up -d 
```

## Comando para ejecutar migraciones de Prisma
```
npx prisma migrate dev --name init
```