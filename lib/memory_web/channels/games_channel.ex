defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Memory.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      Memory.GameBackup.save(socket.assigns[:name], game)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("set", %{"clickID" => click}, socket) do
    game = Memory.GameBackup.load(socket.assigns[:name])

    socket = assign(socket, :game, game)

    game = Game.set(socket.assigns[:game], click, socket.assigns[:name])
    Memory.GameBackup.save(socket.assigns[:name], game)

    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  def handle_in("restart", %{}, socket) do
    game = Game.new()
    Memory.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end
  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
