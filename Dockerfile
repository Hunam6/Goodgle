FROM hayd/ubuntu-deno:1.10.2
EXPOSE 8080
COPY . .
CMD deno run --allow-net --allow-read --allow-env --unstable --import-map=IM.json app.ts
#TODO: wait for Leaf (https://github.com/mandarineorg/leaf) to support Deno 1.10.2 (https://github.com/mandarineorg/leaf/pull/10)
# and for deno_dom to have a working navice backend (https://github.com/b-fuze/deno-dom/issues/48)