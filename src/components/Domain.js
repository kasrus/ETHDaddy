import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const Domain = ({ domain, ethDaddy, provider, id }) => {
  const [owner, setOwner] = useState(null);
  const [hasSold, setHasSold] = useState(false);

  const getOwner = async() => {
    if(domain.isOwned || hasSold) {
      const owner = await ethDaddy.ownerOf(id);
      setOwner(owner);
    }
  }
  const buyHandler = async() => {
    const signer = await provider.getSigner();
    //get the signer connected to the metamask - get the address
    const transaction = await ethDaddy.connect(signer).mint(id, { value: domain.cost });
    await transaction.wait();

    setHasSold(true);
  }

  useEffect(() => {
    getOwner()
  }, [hasSold]);

  return (
    <div className='card'>
      <div className='card__info'>
        <h3>
          {domain.isOwned || owner ? (
            <del>{domain.name}</del>
          ) : (<>{domain.name}</>)}
          </h3>

        <p>
            {domain.isOwned || owner ? (
              <>
                Owned by: <br />
                <span>
                  {owner && owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                </span>
              </>
            ) : (
            <>
              <strong>
                {ethers.utils.formatEther(domain.cost.toString())} 
              </strong>
              ETH
          </>
          )}
      </p>
      </div>

      {!domain.isOwned && !owner && (
        <button 
          type="button"
          className='card__button'
          onClick={() => buyHandler()}>
            Buy it
        </button>
      )}
      
    </div>
  );
}

export default Domain;
