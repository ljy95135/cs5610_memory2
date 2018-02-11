defmodule Memory.Game do

  def new() do
    %{
      memory_contents: shuffle_array(),
      is_answered: get_is_answered(),
      answers: [],
      waiting: false,
      click: 0,
    }
  end

  def shuffle_array() do
    x = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]
    Enum.shuffle(x)
  end

  def get_is_answered() do
    List.duplicate(false, 16)
  end

  def client_view(game) do
    game
  end

  def change_item(ll, index, value) do
    len = length(ll)
    a1 = Enum.slice(ll, 0, index)
    a2 = [value]
    a3 = Enum.slice(ll, index + 1, len)
    a1 ++ a2 ++ a3
  end

  def send_broad(name, game) do
    :timer.sleep(1000)
    game = %{
      memory_contents: game.memory_contents,
      is_answered: game.is_answered,
      answers: [],
      waiting: false,
      click: game.click
    }
    Memory.GameBackup.save(name, game)
    MemoryWeb.Endpoint.broadcast("games:"<>name, "flip back", %{"game" => game})
  end

  def send_broad_match(name, game, n_ans) do
    :timer.sleep(1000)
    game = %{
      memory_contents: game.memory_contents,
      is_answered: n_ans,
      answers: [],
      waiting: false,
      click: game.click
    }
    Memory.GameBackup.save(name, game)
    MemoryWeb.Endpoint.broadcast("games:"<>name, "flip back", %{"game" => game})
  end

  # locgic writing in server
  # jsx to handle flip back
  def set(game, clickID, name) do
    if !Enum.at(game.is_answered, clickID) do
      # first click
      if length(game.answers) == 0 do
        %{
          memory_contents: game.memory_contents,
          is_answered: game.is_answered,
          answers: [clickID],
          waiting: false,
          click: game.click + 1
        }
      else # second click
        n2 = Enum.at(game.answers, 0)
        if !(n2 == clickID) do
          letter1 = Enum.at(game.memory_contents, n2)
          letter2 = Enum.at(game.memory_contents, clickID)
          if letter1 == letter2 do
            # get the pair
            n_is_answered = game.is_answered
            |> change_item(n2, true)
            |> change_item(clickID, true)

            game = %{
              memory_contents: game.memory_contents,
              is_answered: game.is_answered,
              answers: [n2, clickID],
              waiting: true,
              click: game.click + 1
            }
            spawn(__MODULE__, :send_broad_match, [name, game, n_is_answered])
            game
          else
            game = %{
              memory_contents: game.memory_contents,
              is_answered: game.is_answered,
              answers: [n2, clickID],
              waiting: true,
              click: game.click + 1
            }
            spawn(__MODULE__, :send_broad, [name, game])
            game
          end
        else # click same position
          game
        end
      end
    else #already answered
      game
    end
  end
end
