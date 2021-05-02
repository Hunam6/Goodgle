FROM hayd/ubuntu-deno:1.9.0
EXPOSE 8080
COPY . .
CMD deno run --allow-net --allow-read --allow-env --unstable app.ts
#TODO: wait for the next Deno release (ref: https://github.com/b-fuze/deno-dom/issues/40), surely >1.9.2 to get deno-dom compilable, leaf must be used, ref: https://deno.land/x/leaf