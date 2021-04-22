FROM hayd/ubuntu-deno:1.9.0
EXPOSE 8080
COPY . .
CMD deno run --allow-net --allow-read --allow-env --unstable app.ts