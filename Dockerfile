FROM hayd/ubuntu-deno:1.9.0
EXPOSE 8080
COPY . .
RUN deno compile --unstable --allow-net --allow-read --allow-env app.ts
CMD ["./app"]
