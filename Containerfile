FROM denoland/deno:bin-2.6.10

WORKDIR /app
COPY . .

RUN deno install -A
RUN deno task build

CMD ["deno", "task", "start"]