FROM hayd/ubuntu-deno:1.10.2
EXPOSE 8080
COPY . .
CMD deno run --allow-net --allow-read --allow-env --unstable app.ts
#TODO: wait for Leaf (https://github.com/mandarineorg/leaf) to support Deno 1.10.2