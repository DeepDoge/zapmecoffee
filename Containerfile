FROM denoland/deno:2.6.10

WORKDIR /app
COPY . .

RUN deno install
RUN deno task build

CMD ["deno", "task", "start"]